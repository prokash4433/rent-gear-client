import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { EquipmentListItem, EquipmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FeaturedEquipmentsGrid } from "./FeaturedEquipmentsGrid"

const equipments = db.collection("equipments")

/**
 * Listings that are live: approved by the admin, or older documents saved
 * before the status field existed (the same rule checkout uses).
 */
const liveListings = { $or: [{ status: "approved" }, { status: { $exists: false } }] }

/** imageUrls is stored as an array or as one newline-separated string. */
function normalizeImageUrls(imageUrls: unknown): string {
  if (Array.isArray(imageUrls)) {
    return imageUrls.filter((url): url is string => typeof url === "string").join("\n")
  }
  if (typeof imageUrls === "string") return imageUrls
  return ""
}

/** One MongoDB document -> the shape EquipmentCard renders. */
function normalizeDoc(doc: Record<string, unknown>, index: number): EquipmentListItem {
  const status: EquipmentStatus | undefined =
    doc.status === "approved" || doc.status === "rejected" || doc.status === "pending"
      ? doc.status
      : undefined

  return {
    id: doc._id ? String(doc._id) : `equipment-${index}`,
    name: String(doc.name ?? "Untitled Equipment"),
    category: String(doc.category ?? ""),
    description: String(doc.description ?? ""),
    rentalPrice: String(doc.rentalPrice ?? ""),
    rentalType: String(doc.rentalType ?? "Daily"),
    quantity: String(doc.quantity ?? ""),
    brand: String(doc.brand ?? ""),
    model: String(doc.model ?? ""),
    condition: String(doc.condition ?? "Good"),
    location: String(doc.location ?? ""),
    imageUrls: normalizeImageUrls(doc.imageUrls),
    terms: String(doc.terms ?? ""),
    status,
    ownerEmail: String(doc.ownerEmail ?? ""),
  }
}

/**
 * The 6 newest listings worth showing, read straight from MongoDB with a
 * server-side limit(6):
 * - a real http(s) image URL, otherwise the card would show a broken image,
 * - a price above 0, otherwise the card would render "৳NaN" (a few older
 *   approved documents have a null/NaN price).
 * No document carries createdAt, so the time-ordered ObjectId gives the
 * newest-first order.
 */
async function getFeaturedEquipments(): Promise<EquipmentListItem[]> {
  try {
    const docs = await equipments
      .find({
        ...liveListings,
        imageUrls: { $regex: /^https?:\/\// },
        $expr: { $gt: ["$rentalPrice", 0] },
      })
      .sort({ _id: -1 })
      .limit(6)
      .toArray()

    return docs.map((doc, index) => normalizeDoc(doc as Record<string, unknown>, index))
  } catch (error) {
    console.error("Failed to load featured equipments:", error)
    return []
  }
}

const FeaturedEquipments = async () => {
  const items = await getFeaturedEquipments()

  return (
    <section className="bg-[#fffaf0] py-14">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* ---------- Heading ---------- */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            Featured <span className="text-yellow-500">Equipment</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Hand-picked approved listings, ready to rent
          </p>
        </div>

        {/* ---------- Cards ---------- */}
        {items.length > 0 ? (
          <FeaturedEquipmentsGrid items={items} />
        ) : (
          <p className="mt-10 text-center text-gray-500">
            No equipment available right now. Check back soon!
          </p>
        )}

        {/* ---------- Browse all ---------- */}
        <div className="mt-10 text-center">
          <Link
            href="/browse-equipments"
            className={cn(
              buttonVariants(),
              "inline-flex gap-2 bg-brand px-6 py-3 text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
            )}
          >
            Browse All Equipment
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedEquipments
