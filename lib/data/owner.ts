// lib/data/owner.ts
// Read-only helpers for the owner dashboard (Overview, My Rentals, Analytics).
// Not a "use server" file — only server components call these functions.

import { ObjectId } from "mongodb"

import { db } from "@/lib/db"

const bookingsCollection = db.collection("bookings")
const equipmentsCollection = db.collection("equipments")
const paymentsCollection = db.collection("payments")

function firstImage(imageUrls: unknown): string | undefined {
  if (Array.isArray(imageUrls) && typeof imageUrls[0] === "string") {
    return imageUrls[0]
  }
  if (typeof imageUrls === "string" && imageUrls.trim()) {
    return imageUrls.split("\n")[0].trim()
  }
  return undefined
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "number") return new Date(value).toISOString()
  if (typeof value === "string" && value) return value
  return new Date().toISOString()
}

/* ---------- Types ---------- */

export type OwnerEquipment = {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  quantity: number
  status: string
  image?: string
}

export type OwnerRental = {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentImage?: string
  renterName: string
  renterEmail: string
  startDate: string
  endDate: string
  quantity: number
  totalAmount: number
  paymentStatus: "paid" | "unpaid"
  status: string
  createdAt: string
}

export type OwnerDashboardData = {
  stats: {
    listedEquipment: number
    completedRentals: number
    totalEarnings: number
    totalBookings: number
    pendingBookings: number
    approvedListings: number
    pendingApprovals: number
    rejectedListings: number
    inStockAvailable: number
  }
  monthlyRevenue: { month: string; earnings: number }[]
  recentBookings: OwnerRental[]
  topEquipment: OwnerEquipment[]
}

export type OwnerAnalyticsData = {
  totalEarnings: number
  completedRentals: number
  activeListings: number
  monthlyEarnings: { month: string; earnings: number }[]
}

/* ---------- Dashboard Overview ---------- */

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short" })

export async function getOwnerDashboard(
  ownerEmail: string
): Promise<OwnerDashboardData> {
  try {
    const [equipmentDocs, bookingDocs] = await Promise.all([
      equipmentsCollection.find({ ownerEmail }).toArray(),
      bookingsCollection.find({ ownerEmail }).sort({ createdAt: -1 }).toArray(),
    ])

    // Equipment stats
    const listedEquipment = equipmentDocs.length
    const approvedListings = equipmentDocs.filter(
      (e) => e.status === "approved"
    ).length
    const pendingApprovals = equipmentDocs.filter(
      (e) => !e.status || e.status === "pending"
    ).length
    const rejectedListings = equipmentDocs.filter(
      (e) => e.status === "rejected"
    ).length
    const inStockAvailable = equipmentDocs.reduce(
      (sum, e) => sum + (Number(e.quantity) || 0),
      0
    )

    // Booking stats
    const totalBookings = bookingDocs.length
    const completedRentals = bookingDocs.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    ).length
    const pendingBookings = bookingDocs.filter(
      (b) => b.status === "pending" || b.status === "unpaid"
    ).length
    const totalEarnings = bookingDocs
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)

    // Monthly revenue (last 6 months)
    const now = new Date()
    const buckets: {
      year: number
      month: number
      label: string
      earnings: number
    }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: MONTH_FORMAT.format(date),
        earnings: 0,
      })
    }
    const bucketIndex = new Map(
      buckets.map((b, idx) => [`${b.year}-${b.month}`, idx])
    )
    for (const booking of bookingDocs) {
      if (booking.paymentStatus !== "paid") continue
      const created = new Date(toIsoDate(booking.createdAt))
      if (Number.isNaN(created.getTime())) continue
      const idx = bucketIndex.get(
        `${created.getFullYear()}-${created.getMonth()}`
      )
      if (idx !== undefined) {
        buckets[idx].earnings += Number(booking.totalAmount) || 0
      }
    }
    const monthlyRevenue = buckets.map((b) => ({
      month: b.label,
      earnings: b.earnings,
    }))

    // Recent bookings (5)
    const recentRaw = bookingDocs.slice(0, 5)
    // Attach equipment images
    const eqIds = [
      ...new Set(
        recentRaw
          .map((b) => String(b.equipmentId ?? ""))
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ]
    const eqDocs =
      eqIds.length > 0
        ? await equipmentsCollection
            .find({ _id: { $in: eqIds.map((id) => new ObjectId(id)) } })
            .project({ imageUrls: 1 })
            .toArray()
        : []
    const imageMap = new Map(
      eqDocs.map((d) => [String(d._id), firstImage(d.imageUrls)])
    )

    const recentBookings: OwnerRental[] = recentRaw.map((doc) => ({
      id: String(doc._id ?? doc.id ?? ""),
      equipmentId: String(doc.equipmentId ?? ""),
      equipmentName: String(doc.equipmentName ?? "Equipment Rental"),
      equipmentImage: imageMap.get(String(doc.equipmentId ?? "")) ?? undefined,
      renterName: String(
        doc.userName ?? doc.userEmail?.split("@")[0] ?? "Renter"
      ),
      renterEmail: String(doc.userEmail ?? ""),
      startDate: String(doc.startDate ?? ""),
      endDate: String(doc.endDate ?? ""),
      quantity: Number(doc.quantity ?? 1),
      totalAmount: Number(doc.totalAmount ?? 0),
      paymentStatus: doc.paymentStatus === "paid" ? "paid" : "unpaid",
      status: String(doc.status ?? "pending"),
      createdAt: toIsoDate(doc.createdAt),
    }))

    // Top equipment (up to 4)
    const topEquipment: OwnerEquipment[] = equipmentDocs
      .slice(0, 4)
      .map((doc) => ({
        id: String(doc._id ?? ""),
        name: String(doc.name ?? "Equipment"),
        category: String(doc.category ?? ""),
        rentalPrice: Number(doc.rentalPrice ?? 0),
        rentalType: String(doc.rentalType ?? "daily"),
        quantity: Number(doc.quantity ?? 0),
        status: String(doc.status ?? "pending"),
        image: firstImage(doc.imageUrls),
      }))

    return {
      stats: {
        listedEquipment,
        completedRentals,
        totalEarnings,
        totalBookings,
        pendingBookings,
        approvedListings,
        pendingApprovals,
        rejectedListings,
        inStockAvailable,
      },
      monthlyRevenue,
      recentBookings,
      topEquipment,
    }
  } catch (error) {
    console.error("Failed to build owner dashboard:", error)
    return {
      stats: {
        listedEquipment: 0,
        completedRentals: 0,
        totalEarnings: 0,
        totalBookings: 0,
        pendingBookings: 0,
        approvedListings: 0,
        pendingApprovals: 0,
        rejectedListings: 0,
        inStockAvailable: 0,
      },
      monthlyRevenue: [],
      recentBookings: [],
      topEquipment: [],
    }
  }
}

/* ---------- Owner Rentals ---------- */

export async function getOwnerRentals(
  ownerEmail: string
): Promise<OwnerRental[]> {
  try {
    const docs = await bookingsCollection
      .find({ ownerEmail })
      .sort({ createdAt: -1 })
      .toArray()

    // Attach equipment images
    const eqIds = [
      ...new Set(
        docs
          .map((b) => String(b.equipmentId ?? ""))
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ]
    const eqDocs =
      eqIds.length > 0
        ? await equipmentsCollection
            .find({ _id: { $in: eqIds.map((id) => new ObjectId(id)) } })
            .project({ imageUrls: 1 })
            .toArray()
        : []
    const imageMap = new Map(
      eqDocs.map((d) => [String(d._id), firstImage(d.imageUrls)])
    )

    return docs.map((doc) => ({
      id: String(doc._id ?? doc.id ?? ""),
      equipmentId: String(doc.equipmentId ?? ""),
      equipmentName: String(doc.equipmentName ?? "Equipment Rental"),
      equipmentImage: imageMap.get(String(doc.equipmentId ?? "")) ?? undefined,
      renterName: String(
        doc.userName ?? doc.userEmail?.split("@")[0] ?? "Renter"
      ),
      renterEmail: String(doc.userEmail ?? ""),
      startDate: String(doc.startDate ?? ""),
      endDate: String(doc.endDate ?? ""),
      quantity: Number(doc.quantity ?? 1),
      totalAmount: Number(doc.totalAmount ?? 0),
      paymentStatus: doc.paymentStatus === "paid" ? "paid" : "unpaid",
      status: String(doc.status ?? "pending"),
      createdAt: toIsoDate(doc.createdAt),
    }))
  } catch (error) {
    console.error("Failed to load owner rentals:", error)
    return []
  }
}

/* ---------- Owner Analytics ---------- */

export async function getOwnerAnalytics(
  ownerEmail: string
): Promise<OwnerAnalyticsData> {
  try {
    const [equipmentDocs, bookingDocs] = await Promise.all([
      equipmentsCollection.find({ ownerEmail }).toArray(),
      bookingsCollection.find({ ownerEmail }).sort({ createdAt: -1 }).toArray(),
    ])

    const totalEarnings = bookingDocs
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)

    const completedRentals = bookingDocs.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    ).length

    const activeListings = equipmentDocs.length

    // Monthly earnings (last 6 months)
    const now = new Date()
    const buckets: {
      year: number
      month: number
      label: string
      earnings: number
    }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: MONTH_FORMAT.format(date),
        earnings: 0,
      })
    }
    const bucketIndex = new Map(
      buckets.map((b, idx) => [`${b.year}-${b.month}`, idx])
    )
    for (const booking of bookingDocs) {
      if (booking.paymentStatus !== "paid") continue
      const created = new Date(toIsoDate(booking.createdAt))
      if (Number.isNaN(created.getTime())) continue
      const idx = bucketIndex.get(
        `${created.getFullYear()}-${created.getMonth()}`
      )
      if (idx !== undefined) {
        buckets[idx].earnings += Number(booking.totalAmount) || 0
      }
    }
    const monthlyEarnings = buckets.map((b) => ({
      month: b.label,
      earnings: b.earnings,
    }))

    return { totalEarnings, completedRentals, activeListings, monthlyEarnings }
  } catch (error) {
    console.error("Failed to build owner analytics:", error)
    return {
      totalEarnings: 0,
      completedRentals: 0,
      activeListings: 0,
      monthlyEarnings: [],
    }
  }
}
