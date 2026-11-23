// lib/data/customer.ts
// Read-only helpers for the customer dashboard and My Bookings.
// This module is NOT a "use server" file on purpose: its functions take a
// userEmail argument, and server-action files expose every export as a
// publicly callable endpoint. Keeping them here means only server components
// (which already know the signed-in user) can run them.

import { ObjectId } from "mongodb"

import { db } from "@/lib/db"
import type {
  BookingStatus,
  CustomerDashboardData,
  MyBooking,
  UserActivityStats,
} from "@/lib/types"

const bookingsCollection = db.collection("bookings")
const equipmentsCollection = db.collection("equipments")
const favouritesCollection = db.collection("favourites")
const reviewsCollection = db.collection("reviews")

const KNOWN_STATUSES: BookingStatus[] = [
  "unpaid",
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "number") return new Date(value).toISOString()
  if (typeof value === "string" && value) return value
  return new Date().toISOString()
}

function firstImage(imageUrls: unknown): string | undefined {
  if (Array.isArray(imageUrls) && typeof imageUrls[0] === "string") {
    return imageUrls[0]
  }
  if (typeof imageUrls === "string" && imageUrls.trim()) {
    return imageUrls.split("\n")[0].trim()
  }
  return undefined
}

/** Maps one bookings document to the shape the UI renders. */
function mapBooking(doc: Record<string, unknown>): MyBooking {
  const rawStatus = String(doc.status ?? "pending")
  // Checkout creates bookings as "unpaid"; in the customer UI that reads as
  // "pending" — the payment chip is what tells the user it still needs paying.
  const status: BookingStatus =
    rawStatus === "unpaid"
      ? "pending"
      : (KNOWN_STATUSES as string[]).includes(rawStatus)
        ? (rawStatus as BookingStatus)
        : doc.paymentStatus === "paid"
          ? "confirmed"
          : "pending"

  return {
    id: doc._id ? String(doc._id) : String(doc.id ?? ""),
    equipmentId: String(doc.equipmentId ?? ""),
    equipmentName: String(doc.equipmentName ?? "Equipment Rental"),
    startDate: String(doc.startDate ?? ""),
    endDate: String(doc.endDate ?? ""),
    quantity: Number(doc.quantity ?? 1),
    rentalType: String(doc.rentalType ?? "Daily"),
    periods: Number(doc.periods ?? 1),
    totalAmount: Number(doc.totalAmount ?? 0),
    deliveryAddress: String(doc.deliveryAddress ?? ""),
    contactNumber: String(doc.contactNumber ?? ""),
    notes: doc.notes ? String(doc.notes) : undefined,
    status,
    paymentStatus: doc.paymentStatus === "paid" ? "paid" : "unpaid",
    createdAt: toIsoDate(doc.createdAt),
  }
}

/** Attaches the current equipment image to bookings (bookings don't store one). */
async function withEquipmentImage(bookings: MyBooking[]): Promise<MyBooking[]> {
  const ids = [...new Set(bookings.map((b) => b.equipmentId).filter(Boolean))]
  if (ids.length === 0) return bookings

  const validIds = ids.filter((id) => ObjectId.isValid(id))
  if (validIds.length === 0) return bookings

  const docs = await equipmentsCollection
    .find({ _id: { $in: validIds.map((id) => new ObjectId(id)) } })
    .project({ imageUrls: 1 })
    .toArray()

  const imageById = new Map(
    docs.map((doc) => [String(doc._id), firstImage(doc.imageUrls)])
  )

  return bookings.map((booking) => {
    const image = imageById.get(booking.equipmentId)
    return image ? { ...booking, equipmentImage: image } : booking
  })
}

/** All bookings of one customer, newest first, with equipment images. */
export async function getMyBookings(userEmail: string): Promise<MyBooking[]> {
  try {
    const docs = await bookingsCollection
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray()
    const bookings = docs.map((doc) => mapBooking(doc as Record<string, unknown>))
    return withEquipmentImage(bookings)
  } catch (error) {
    console.error("Failed to load customer bookings:", error)
    return []
  }
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short" })

/** Live stats, chart series and recent bookings for the customer dashboard. */
export async function getCustomerDashboard(
  userEmail: string
): Promise<CustomerDashboardData> {
  try {
    const [bookings, favoriteItems, reviews] = await Promise.all([
      getMyBookings(userEmail),
      favouritesCollection.countDocuments({ userEmail }),
      reviewsCollection.countDocuments({ userEmail }),
    ])

    const count = (status: BookingStatus) =>
      bookings.filter((b) => b.status === status).length

    const totalSpent = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalAmount, 0)

    // Last 6 months (including the current one), oldest first.
    const now = new Date()
    const buckets: { year: number; month: number; label: string; bookings: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: MONTH_FORMAT.format(date),
        bookings: 0,
      })
    }
    const bucketIndex = new Map(
      buckets.map((bucket, index) => [`${bucket.year}-${bucket.month}`, index])
    )
    for (const booking of bookings) {
      const created = new Date(booking.createdAt)
      if (Number.isNaN(created.getTime())) continue
      const index = bucketIndex.get(`${created.getFullYear()}-${created.getMonth()}`)
      if (index !== undefined) buckets[index].bookings += 1
    }
    const monthly = buckets.map((bucket) => ({
      month: bucket.label,
      bookings: bucket.bookings,
    }))

    const statusBreakdown = [
      { name: "Confirmed", value: count("confirmed"), color: "#10b981" },
      { name: "Pending", value: count("pending"), color: "#f0b501" },
      { name: "Completed", value: count("completed"), color: "#0ea5e9" },
      { name: "Cancelled", value: count("cancelled"), color: "#ef4444" },
    ]

    return {
      stats: {
        totalBookings: bookings.length,
        favoriteItems,
        totalSpent,
        reviews,
        pending: count("pending"),
        confirmed: count("confirmed"),
        cancelled: count("cancelled"),
        completed: count("completed"),
      },
      monthly,
      statusBreakdown,
      recent: bookings.slice(0, 5),
    }
  } catch (error) {
    console.error("Failed to build customer dashboard:", error)
    return {
      stats: {
        totalBookings: 0,
        favoriteItems: 0,
        totalSpent: 0,
        reviews: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
      },
      monthly: [],
      statusBreakdown: [],
      recent: [],
    }
  }
}

/** Booking/favourite activity for one user, used by the admin Manage User page. */
export async function getUserActivityStats(
  userEmail: string
): Promise<UserActivityStats> {
  try {
    const [totalBookings, activeBookings, spentDocs, favoriteItems] =
      await Promise.all([
        bookingsCollection.countDocuments({ userEmail }),
        bookingsCollection.countDocuments({
          userEmail,
          status: { $in: ["unpaid", "pending", "confirmed"] },
        }),
        bookingsCollection
          .find({ userEmail, paymentStatus: "paid" })
          .project({ totalAmount: 1 })
          .toArray(),
        favouritesCollection.countDocuments({ userEmail }),
      ])

    const totalSpent = spentDocs.reduce(
      (sum, doc) => sum + (Number(doc.totalAmount) || 0),
      0
    )

    return { totalBookings, activeBookings, totalSpent, favoriteItems }
  } catch (error) {
    console.error("Failed to load user activity stats:", error)
    return { totalBookings: 0, activeBookings: 0, totalSpent: 0, favoriteItems: 0 }
  }
}
