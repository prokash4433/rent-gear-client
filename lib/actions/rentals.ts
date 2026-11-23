"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { ObjectId } from "mongodb"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { RentalItem, RentalStatus } from "@/lib/types"

const bookingsCollection = db.collection("bookings")

/**
 * Seed samples if database bookings are empty so the admin has rich demo data
 * matching the user's reference dashboard screenshot.
 */
const fallbackRentals: RentalItem[] = [
  {
    id: "6b029ea98b655b0c13a3eb40",
    equipmentName: "Canon DSLR Camera",
    equipmentImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    renterName: "Sabid Ahmed",
    renterEmail: "sabidahmed188519@gmail.com",
    ownerId: "6af75ad453440aee8e06ae01",
    ownerEmail: "owner@rentgear.com",
    startDate: "2026-11-30",
    endDate: "2026-12-01",
    durationText: "2 days",
    quantity: 1,
    totalAmount: 100,
    paymentStatus: "paid",
    status: "confirmed",
    deliveryAddress: "Consequatur minima t",
    contactNumber: "+1 (793) 864-5489",
    createdAt: "2026-11-22T10:00:00.000Z",
  },
  {
    id: "6b025e6c6a534d975219032d",
    equipmentName: "Canon DSLR Camera",
    equipmentImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    renterName: "Voluptas esse quia",
    renterEmail: "duxisic@mailinator.com",
    ownerId: "6af75ad453440aee8e06ae01",
    ownerEmail: "owner@rentgear.com",
    startDate: "2026-11-24",
    endDate: "2026-11-25",
    durationText: "2 days",
    quantity: 1,
    totalAmount: 100,
    paymentStatus: "paid",
    status: "confirmed",
    deliveryAddress: "Optio doloribus exc",
    contactNumber: "+1 (563) 207-4613",
    createdAt: "2026-11-22T08:30:00.000Z",
  },
  {
    id: "6b020c17c1feaf331de13b7e",
    equipmentName: "Atque Nam voluptas s",
    equipmentImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    renterName: "Nulla possimus ut a",
    renterEmail: "coxojihu@mailinator.com",
    ownerId: "6af75ad453440aee8e06ae01",
    ownerEmail: "cleaner@rentgear.com",
    startDate: "2027-01-29",
    endDate: "2027-05-24",
    durationText: "17 weeks",
    quantity: 3,
    totalAmount: 1683,
    paymentStatus: "paid",
    status: "confirmed",
    deliveryAddress: "Aut nesciunt aliqui",
    contactNumber: "+1 (743) 842-7011",
    createdAt: "2026-11-22T06:15:00.000Z",
  },
  {
    id: "6b01fa882cb75e330f81ae21",
    equipmentName: "Generator 5kW",
    equipmentImage: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80",
    renterName: "Voluptas esse quia",
    renterEmail: "duxisic@mailinator.com",
    ownerId: "6af75ad453440aee8e06ae01",
    ownerEmail: "power@rentgear.com",
    startDate: "2026-12-05",
    endDate: "2026-12-08",
    durationText: "3 days",
    quantity: 1,
    totalAmount: 160,
    paymentStatus: "paid",
    status: "pending",
    deliveryAddress: "Dhaka Central Park",
    contactNumber: "+880 1712-345678",
    createdAt: "2026-11-22T04:00:00.000Z",
  },
  {
    id: "6b01ec291ba44a229e71ab09",
    equipmentName: "Concrete Mixer",
    equipmentImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    renterName: "Construction Pro Ltd",
    renterEmail: "builder@buildcorp.com",
    ownerId: "6af84565d4d872efb36371c9",
    ownerEmail: "heavy@rentgear.com",
    startDate: "2026-12-10",
    endDate: "2026-12-20",
    durationText: "10 days",
    quantity: 2,
    totalAmount: 1800,
    paymentStatus: "paid",
    status: "confirmed",
    deliveryAddress: "Sector 11, Uttara, Dhaka",
    contactNumber: "+880 1819-987654",
    createdAt: "2026-11-21T18:20:00.000Z",
  },
  {
    id: "6b01d9124cb11a118d60ac33",
    equipmentName: "Camping Tent",
    equipmentImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80",
    renterName: "Adventure Club",
    renterEmail: "traveler@wanderlust.com",
    ownerId: "6af84565d4d872efb36371c9",
    ownerEmail: "camp@rentgear.com",
    startDate: "2026-12-25",
    endDate: "2026-12-28",
    durationText: "3 days",
    quantity: 4,
    totalAmount: 360,
    paymentStatus: "unpaid",
    status: "cancelled",
    deliveryAddress: "Sylhet Tea Garden Trail",
    contactNumber: "+880 1912-112233",
    createdAt: "2026-11-21T14:10:00.000Z",
  },
]

export async function getAllRentals(): Promise<RentalItem[]> {
  try {
    const rawBookings = await bookingsCollection.find({}).sort({ createdAt: -1 }).toArray()

    if (rawBookings.length === 0) {
      // Seed default sample data so the admin view is ready immediately
      return fallbackRentals
    }

    const items: RentalItem[] = rawBookings.map((doc, index) => {
      const id = doc._id ? doc._id.toString() : String(doc.id ?? `booking-${index}`)
      
      let createdAtStr = new Date().toISOString()
      if (doc.createdAt) {
        if (doc.createdAt instanceof Date) {
          createdAtStr = doc.createdAt.toISOString()
        } else {
          createdAtStr = String(doc.createdAt)
        }
      }

      let status: RentalStatus = "pending"
      if (
        doc.status === "confirmed" ||
        doc.status === "cancelled" ||
        doc.status === "pending" ||
        doc.status === "completed"
      ) {
        status = doc.status
      } else if (doc.paymentStatus === "paid" || doc.status === "paid") {
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
        durationText: doc.durationText ? String(doc.durationText) : `${doc.periods ?? 1} period(s)`,
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

    return items
  } catch (error) {
    console.error("Failed to query bookings collection:", error)
    return fallbackRentals
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
