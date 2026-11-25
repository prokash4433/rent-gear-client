// lib/data/owner.ts
// Read-only helpers for the owner dashboard, My Equipment, My Rentals and
// Analytics. Not a "use server" file — server actions expose every export as
// a public endpoint, so only server components (which already know the
// signed-in owner) may call these.

import { ObjectId } from "mongodb"
import type { Document, Filter } from "mongodb"

import { db } from "@/lib/db"
import type { EquipmentListItem, EquipmentStatus } from "@/lib/types"

const bookingsCollection = db.collection("bookings")
const equipmentsCollection = db.collection("equipments")

/* ---------- Shared helpers ---------- */

/** The image is stored as an array or as one plain string. */
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

function normalizeStatus(value: unknown): EquipmentStatus {
  return value === "approved" || value === "rejected" || value === "pending"
    ? value
    : "pending"
}

/* ---------- Types ---------- */

/** One listing as every owner page renders it (plus its first image). */
export type OwnerEquipment = EquipmentListItem & { image?: string }

/** One booking made against one of the owner's listings. */
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

export type StatusSlice = { name: string; value: number; color: string }

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
  /** Paid earnings per month, last 6 months, oldest first. */
  monthlyRevenue: { month: string; earnings: number }[]
  /** Bookings created per month, last 6 months, oldest first. */
  monthlyBookings: { month: string; bookings: number }[]
  statusBreakdown: StatusSlice[]
  recentBookings: OwnerRental[]
  topEquipment: OwnerEquipment[]
}

export type OwnerAnalyticsData = {
  stats: {
    totalEarnings: number
    completedRentals: number
    totalListings: number
    approvedListings: number
    totalBookings: number
    pendingBookings: number
    /** Value of the bookings that have not been paid yet. */
    unpaidEarnings: number
  }
  monthlyEarnings: { month: string; earnings: number }[]
  monthlyBookings: { month: string; bookings: number }[]
  statusBreakdown: StatusSlice[]
  /** Highest earning listings, best first. */
  topEquipment: { name: string; earnings: number; bookings: number }[]
}

/* ---------- Query helpers ---------- */

/**
 * Bookings that belong to this owner. Older bookings were stored with an
 * empty `ownerEmail`, so they are also matched through the listing they
 * were made against.
 */
async function findOwnerBookings(ownerEmail: string, equipmentIds: string[]) {
  const filter =
    equipmentIds.length > 0
      ? { $or: [{ ownerEmail }, { equipmentId: { $in: equipmentIds } }] }
      : { ownerEmail }

  return bookingsCollection.find(filter).sort({ createdAt: -1 }).toArray()
}

/** Listings referenced by bookings, whether `_id` is an ObjectId or a string. */
async function findEquipmentsByIds(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return []

  const objectIds = unique
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id))

  // MongoDB accepts ObjectId and string values in the same $in list.
  const filter = {
    _id: { $in: [...objectIds, ...unique] },
  } as unknown as Filter<Document>
  return equipmentsCollection.find(filter).toArray()
}

function mapEquipment(doc: Document): OwnerEquipment {
  const imageUrls = Array.isArray(doc.imageUrls)
    ? doc.imageUrls.join("\n")
    : typeof doc.imageUrls === "string"
      ? doc.imageUrls
      : ""

  return {
    id: String(doc._id ?? doc.id ?? ""),
    name: String(doc.name ?? "Untitled Equipment"),
    category: String(doc.category ?? ""),
    description: String(doc.description ?? ""),
    rentalPrice: String(doc.rentalPrice ?? "0"),
    rentalType: String(doc.rentalType ?? "Daily"),
    quantity: String(doc.quantity ?? "0"),
    brand: String(doc.brand ?? ""),
    model: String(doc.model ?? ""),
    condition: String(doc.condition ?? ""),
    location: String(doc.location ?? ""),
    imageUrls,
    terms: String(doc.terms ?? ""),
    status: normalizeStatus(doc.status),
    ownerEmail: String(doc.ownerEmail ?? ""),
    image: firstImage(doc.imageUrls),
  }
}

function mapBooking(doc: Document, equipmentImage?: string): OwnerRental {
  return {
    id: String(doc._id ?? doc.id ?? ""),
    equipmentId: String(doc.equipmentId ?? ""),
    equipmentName: String(doc.equipmentName ?? "Equipment Rental"),
    equipmentImage,
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
  }
}

/** The owner's listings plus their bookings, with equipment images attached. */
async function loadOwnerData(ownerEmail: string): Promise<{
  equipment: OwnerEquipment[]
  bookings: OwnerRental[]
}> {
  const equipmentDocs = await equipmentsCollection
    .find({ ownerEmail })
    .sort({ _id: -1 })
    .toArray()
  const equipment = equipmentDocs.map(mapEquipment)

  const bookingDocs = await findOwnerBookings(
    ownerEmail,
    equipment.map((item) => item.id)
  )

  // Images: start with the owner's own listings, then fetch any listing a
  // booking points at that is not part of that set (e.g. deleted ones).
  const imageById = new Map<string, string | undefined>()
  for (const item of equipment) imageById.set(item.id, item.image)
  const knownIds = new Set(imageById.keys())
  const missingIds = [
    ...new Set(
      bookingDocs
        .map((doc) => String(doc.equipmentId ?? ""))
        .filter((id) => id && !knownIds.has(id))
    ),
  ]
  for (const doc of await findEquipmentsByIds(missingIds)) {
    imageById.set(String(doc._id), firstImage(doc.imageUrls))
  }

  const bookings = bookingDocs.map((doc) =>
    mapBooking(doc, imageById.get(String(doc.equipmentId ?? "")))
  )

  return { equipment, bookings }
}

/* ---------- Chart series ---------- */

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short" })

type MonthBucket = { year: number; month: number; label: string }

/** The last 6 months (including the current one), oldest first. */
function lastSixMonths(): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: MONTH_FORMAT.format(date),
    })
  }
  return buckets
}

function monthKey(value: unknown): string | null {
  const date = new Date(toIsoDate(value))
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${date.getMonth()}`
}

/** Paid earnings of the last 6 months, oldest month first. */
function earningsByMonth(
  bookings: { totalAmount: number; paymentStatus: string; createdAt: string }[]
) {
  const buckets = lastSixMonths()
  const index = new Map(buckets.map((b, i) => [`${b.year}-${b.month}`, i]))
  const totals = buckets.map(() => 0)

  for (const booking of bookings) {
    if (booking.paymentStatus !== "paid") continue
    const key = monthKey(booking.createdAt)
    const at = key === null ? undefined : index.get(key)
    if (at !== undefined) totals[at] += booking.totalAmount
  }

  return buckets.map((bucket, i) => ({
    month: bucket.label,
    earnings: totals[i],
  }))
}

/** How many bookings were created per month, oldest month first. */
function bookingsByMonth(bookings: { createdAt: string }[]) {
  const buckets = lastSixMonths()
  const index = new Map(buckets.map((b, i) => [`${b.year}-${b.month}`, i]))
  const counts = buckets.map(() => 0)

  for (const booking of bookings) {
    const key = monthKey(booking.createdAt)
    const at = key === null ? undefined : index.get(key)
    if (at !== undefined) counts[at] += 1
  }

  return buckets.map((bucket, i) => ({
    month: bucket.label,
    bookings: counts[i],
  }))
}

const SLICE_COLORS = {
  pending: "#f0b501",
  confirmed: "#10b981",
  completed: "#0ea5e9",
  cancelled: "#ef4444",
} as const

/** Pending / confirmed / completed / cancelled counts for the donut chart. */
function statusBreakdown(bookings: { status: string }[]): StatusSlice[] {
  const count = (status: string) =>
    bookings.filter((booking) => booking.status === status).length
  // Bookings stored as "unpaid" (or with an unknown status) still need
  // attention, so everything that is not confirmed/completed/cancelled counts
  // as pending.
  const pending =
    bookings.length -
    count("confirmed") -
    count("completed") -
    count("cancelled")

  return [
    { name: "Pending", value: Math.max(pending, 0), color: SLICE_COLORS.pending },
    { name: "Confirmed", value: count("confirmed"), color: SLICE_COLORS.confirmed },
    { name: "Completed", value: count("completed"), color: SLICE_COLORS.completed },
    { name: "Cancelled", value: count("cancelled"), color: SLICE_COLORS.cancelled },
  ]
}

/* ---------- My Equipment ---------- */

/** Every listing published by one owner, newest first. */
export async function getOwnerEquipments(
  ownerEmail: string
): Promise<OwnerEquipment[]> {
  try {
    const docs = await equipmentsCollection
      .find({ ownerEmail })
      .sort({ _id: -1 })
      .toArray()
    return docs.map(mapEquipment)
  } catch (error) {
    console.error("Failed to load owner equipment:", error)
    return []
  }
}

/* ---------- My Rentals ---------- */

/** Every booking made against one owner's listings, newest first. */
export async function getOwnerRentals(
  ownerEmail: string
): Promise<OwnerRental[]> {
  try {
    const { bookings } = await loadOwnerData(ownerEmail)
    return bookings
  } catch (error) {
    console.error("Failed to load owner rentals:", error)
    return []
  }
}

/* ---------- Dashboard overview ---------- */

export async function getOwnerDashboard(
  ownerEmail: string
): Promise<OwnerDashboardData> {
  try {
    const { equipment, bookings } = await loadOwnerData(ownerEmail)

    const listedEquipment = equipment.length
    const approvedListings = equipment.filter(
      (item) => item.status === "approved"
    ).length
    const pendingApprovals = equipment.filter(
      (item) => item.status === "pending"
    ).length
    const rejectedListings = equipment.filter(
      (item) => item.status === "rejected"
    ).length
    const inStockAvailable = equipment.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    )

    const totalBookings = bookings.length
    const completedRentals = bookings.filter(
      (booking) => booking.status === "confirmed" || booking.status === "completed"
    ).length
    const pendingBookings = bookings.filter(
      (booking) =>
        booking.status === "pending" ||
        booking.status === "unpaid" ||
        booking.paymentStatus === "unpaid"
    ).length
    const totalEarnings = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

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
      monthlyRevenue: earningsByMonth(bookings),
      monthlyBookings: bookingsByMonth(bookings),
      statusBreakdown: statusBreakdown(bookings),
      recentBookings: bookings.slice(0, 5),
      topEquipment: equipment.slice(0, 4),
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
      monthlyBookings: [],
      statusBreakdown: [],
      recentBookings: [],
      topEquipment: [],
    }
  }
}

/* ---------- Analytics ---------- */

export async function getOwnerAnalytics(
  ownerEmail: string
): Promise<OwnerAnalyticsData> {
  try {
    const { equipment, bookings } = await loadOwnerData(ownerEmail)

    const totalEarnings = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

    const unpaidEarnings = bookings
      .filter((booking) => booking.paymentStatus !== "paid")
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

    const completedRentals = bookings.filter(
      (booking) => booking.status === "confirmed" || booking.status === "completed"
    ).length

    const pendingBookings = bookings.filter(
      (booking) =>
        booking.status === "pending" ||
        booking.status === "unpaid" ||
        booking.paymentStatus === "unpaid"
    ).length

    // Earnings per listing, best first (uses the name stored on the booking
    // so listings that were removed still show up in the history).
    const perEquipment = new Map<string, { name: string; earnings: number; bookings: number }>()
    for (const booking of bookings) {
      const key = booking.equipmentId || booking.equipmentName
      const entry = perEquipment.get(key) ?? {
        name: booking.equipmentName,
        earnings: 0,
        bookings: 0,
      }
      entry.bookings += 1
      if (booking.paymentStatus === "paid") entry.earnings += booking.totalAmount
      perEquipment.set(key, entry)
    }
    const topEquipment = [...perEquipment.values()]
      .sort((a, b) => b.earnings - a.earnings || b.bookings - a.bookings)
      .slice(0, 5)

    return {
      stats: {
        totalEarnings,
        completedRentals,
        totalListings: equipment.length,
        approvedListings: equipment.filter((item) => item.status === "approved")
          .length,
        totalBookings: bookings.length,
        pendingBookings,
        unpaidEarnings,
      },
      monthlyEarnings: earningsByMonth(bookings),
      monthlyBookings: bookingsByMonth(bookings),
      statusBreakdown: statusBreakdown(bookings),
      topEquipment,
    }
  } catch (error) {
    console.error("Failed to build owner analytics:", error)
    return {
      stats: {
        totalEarnings: 0,
        completedRentals: 0,
        totalListings: 0,
        approvedListings: 0,
        totalBookings: 0,
        pendingBookings: 0,
        unpaidEarnings: 0,
      },
      monthlyEarnings: [],
      monthlyBookings: [],
      statusBreakdown: [],
      topEquipment: [],
    }
  }
}
