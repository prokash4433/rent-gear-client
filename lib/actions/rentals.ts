"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { ObjectId } from "mongodb"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { rentalDays } from "@/lib/bookings"
import type { RentalItem, RentalStatus } from "@/lib/types"

const bookingsCollection = db.collection("bookings")
const equipmentsCollection = db.collection("equipments")

/** Bookings store no image — the equipment record holds it (list or newline text). */
function firstImage(source: unknown): string | undefined {
  if (Array.isArray(source) && typeof source[0] === "string") {
    return source[0]
  }
  if (typeof source === "string" && source.trim()) {
    return source.split("\n")[0].trim()
  }
  return undefined
}

/** Duration label built from the booking's own rentalType/periods fields. */
function buildDurationText(doc: Record<string, unknown>): string {
  if (doc.durationText) return String(doc.durationText)

  const periods = Number(doc.periods ?? 0)
  if (periods > 0) {
    const type = String(doc.rentalType ?? "Daily").toLowerCase()
    const unit = type.startsWith("week") ? "week" : type.startsWith("month") ? "month" : "day"
    return `${periods} ${unit}${periods === 1 ? "" : "s"}`
  }

  const days = rentalDays(String(doc.startDate ?? ""), String(doc.endDate ?? ""))
  return days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "Rental"
}

/**
 * Reads every booking document from the server and maps it to the shape the
 * rentals UI renders. Equipment images are resolved from the equipment record.
 */
export async function getAllRentals(): Promise<RentalItem[]> {
  try {
    const rawBookings = await bookingsCollection.find({}).sort({ createdAt: -1 }).toArray()

    const items: RentalItem[] = rawBookings.map((doc, index) => {
      const record = doc as Record<string, unknown>
      const id = doc._id ? doc._id.toString() : String(doc.id ?? `booking-${index}`)

      let createdAtStr = new Date().toISOString()
      if (doc.createdAt) {
        if (doc.createdAt instanceof Date) {
          createdAtStr = doc.createdAt.toISOString()
        } else {
          createdAtStr = String(doc.createdAt)
        }
      }

      // Checkout writes status "unpaid" — until it is paid it reads as "pending".
      let status: RentalStatus = "pending"
      if (
        doc.status === "confirmed" ||
        doc.status === "cancelled" ||
        doc.status === "pending" ||
        doc.status === "completed"
      ) {
        status = doc.status
      } else if (doc.status === "paid") {
        status = "confirmed"
      } else if (doc.paymentStatus === "paid") {
        status = "confirmed"
      }

      return {
        id,
        equipmentId: doc.equipmentId ? String(doc.equipmentId) : undefined,
        equipmentName: String(doc.equipmentName ?? "Equipment Rental"),
        equipmentImage: doc.equipmentImage ? String(doc.equipmentImage) : undefined,
        ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
        ownerEmail: String(doc.ownerEmail ?? ""),
        renterName: String(doc.userName ?? doc.userEmail?.split("@")[0] ?? "Renter"),
        renterEmail: String(doc.userEmail ?? ""),
        startDate: String(doc.startDate ?? ""),
        endDate: String(doc.endDate ?? ""),
        durationText: buildDurationText(record),
        quantity: Number(doc.quantity ?? 1),
        totalAmount: Number(doc.totalAmount ?? 0),
        paymentStatus: doc.paymentStatus === "paid" ? "paid" : "unpaid",
        status,
        deliveryAddress: String(doc.deliveryAddress ?? "Pickup"),
        contactNumber: String(doc.contactNumber ?? "N/A"),
        notes: doc.notes ? String(doc.notes) : undefined,
        createdAt: createdAtStr,
      }
    })

    // Attach the current equipment image to every booking that has none.
    const equipmentIds = [
      ...new Set(
        items
          .map((item) => item.equipmentId)
          .filter((equipmentId): equipmentId is string => Boolean(equipmentId))
      ),
    ].filter((equipmentId) => ObjectId.isValid(equipmentId))

    if (equipmentIds.length > 0) {
      const equipmentDocs = await equipmentsCollection
        .find({ _id: { $in: equipmentIds.map((equipmentId) => new ObjectId(equipmentId)) } })
        .project({ imageUrls: 1, photos: 1 })
        .toArray()

      const imageById = new Map<string, string>()
      for (const equipmentDoc of equipmentDocs) {
        const image =
          firstImage(equipmentDoc.imageUrls) ?? firstImage(equipmentDoc.photos)
        if (image) imageById.set(String(equipmentDoc._id), image)
      }

      for (const item of items) {
        if (item.equipmentImage || !item.equipmentId) continue
        const image = imageById.get(item.equipmentId)
        if (image) item.equipmentImage = image
      }
    }

    return items
  } catch (error) {
    console.error("Failed to query bookings collection:", error)
    return []
  }
}

export async function updateRentalStatus(bookingId: string, status: RentalStatus) {
  try {
    const filter = ObjectId.isValid(bookingId)
      ? { $or: [{ _id: new ObjectId(bookingId) }, { id: bookingId }] }
      : { id: bookingId }

    const updateDoc: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    }

    if (status === "confirmed") {
      updateDoc.paymentStatus = "paid"
    }

    const result = await bookingsCollection.updateOne(filter, { $set: updateDoc })

    revalidatePath("/dashboard/admin/all-rentals")
    revalidatePath("/dashboard/all-rentals")
    revalidatePath("/dashboard/admin")

    return { success: true, status, matched: result.matchedCount }
  } catch (error) {
    console.error(`Failed to update booking status for ${bookingId}:`, error)
    return { success: false, error: "Database update failed" }
  }
}

export async function deleteRental(bookingId: string) {
  try {
    const filter = ObjectId.isValid(bookingId)
      ? { $or: [{ _id: new ObjectId(bookingId) }, { id: bookingId }] }
      : { id: bookingId }

    const result = await bookingsCollection.deleteOne(filter)

    revalidatePath("/dashboard/admin/all-rentals")
    revalidatePath("/dashboard/all-rentals")
    revalidatePath("/dashboard/admin")

    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    console.error(`Failed to delete booking ${bookingId}:`, error)
    return { success: false, error: "Database delete failed" }
  }
}

/**
 * Lets a customer cancel their own booking. The session email must own the
 * booking, only unpaid bookings can be cancelled, and finished bookings
 * (cancelled / completed) are left alone.
 */
export async function cancelMyBooking(bookingId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email) {
      return { success: false, error: "Sign in required" }
    }
    if (!ObjectId.isValid(bookingId)) {
      return { success: false, error: "Invalid booking" }
    }

    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(bookingId),
        userEmail: session.user.email,
        paymentStatus: "unpaid",
        status: { $nin: ["cancelled", "completed"] },
      },
      { $set: { status: "cancelled", updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return { success: false, error: "This booking can no longer be cancelled" }
    }

    revalidatePath("/dashboard/customer/my-booking")
    revalidatePath("/dashboard/customer")
    return { success: true }
  } catch (error) {
    console.error(`Failed to cancel booking ${bookingId}:`, error)
    return { success: false, error: "Could not cancel the booking" }
  }
}
