import Link from "next/link"
import { Package } from "lucide-react"

import { db } from "@/lib/db"

const equipments = db.collection("equipments")

/** The categories shown in the reference design. */
const categories = [
  {
    slug: "agriculture",
    label: "Agriculture Equipment",
    description: "Farm tractors, tillers, harvesters...",
  },
  {
    slug: "cleaning",
    label: "Cleaning Equipment",
    description: "Industrial pressure washers, floor scrubbers...",
  },
  {
    slug: "construction",
    label: "Construction Equipment",
    description: "Heavy machinery, excavators, cranes...",
  },
  {
    slug: "electronics",
    label: "Electronics",
    description: "Laptops, projectors, monitors, audio gear...",
  },
  {
    slug: "events",
    label: "Event Equipment",
    description: "Stages, sound systems, lighting...",
  },
]

/**
 * Listings that are live: approved by the admin, or older documents saved
 * before the status field existed (the same rule checkout uses).
 */
const liveListings = { $or: [{ status: "approved" }, { status: { $exists: false } }] }

/** imageUrls is stored as an array or as one newline-separated string. */
function firstImageUrl(source: unknown): string {
  const raw = Array.isArray(source)
    ? source[0]
    : typeof source === "string"
      ? source.split("\n")[0]
      : ""
  const url = typeof raw === "string" ? raw.trim() : ""
  // Placeholder text instead of a URL would render as a broken image.
  return /^https?:\/\//.test(url) ? url : ""
}

/**
 * Item count plus a representative image for every category, straight from
 * MongoDB. Sorted newest-first so the group picks the newest listing's image.
 */
async function getCategoryStats(): Promise<Record<string, { count: number; image: string }>> {
  try {
    const rows = await equipments
      .aggregate([
        { $match: { ...liveListings, category: { $in: categories.map((c) => c.label) } } },
        { $sort: { _id: -1 } },
        { $group: { _id: "$category", count: { $sum: 1 }, imageUrls: { $first: "$imageUrls" } } },
      ])
      .toArray()

    const stats: Record<string, { count: number; image: string }> = {}
    for (const row of rows) {
      stats[String(row._id)] = {
        count: Number(row.count ?? 0),
        image: firstImageUrl(row.imageUrls),
      }
    }
    return stats
  } catch (error) {
    console.error("Failed to load category stats:", error)
    return {}
  }
}

export default async function PopularCategory() {
  const stats = await getCategoryStats()

  return (
    <section className="bg-[#fffaf0] py-14">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* ---------- Heading with side dashes (reference design) ---------- */}
        <div className="text-center">
          <h2 className="flex items-center justify-center gap-3 text-3xl font-bold text-neutral-900 md:text-4xl">
            <span aria-hidden className="hidden h-0.5 w-10 rounded-full bg-brand sm:block" />
            Popular Categories
            <span aria-hidden className="hidden h-0.5 w-10 rounded-full bg-brand sm:block" />
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore verified equipment categories from our real-time database
          </p>
        </div>

        {/* ---------- Category cards ---------- */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const stat = stats[category.label] ?? { count: 0, image: "" }

            return (
              <Link
                key={category.slug}
                href={`/browse-equipments?category=${category.slug}`}
                className="group flex flex-col items-center rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg"
              >
                <div className="relative size-16 overflow-hidden rounded-2xl border border-border/60 bg-muted/60">
                  {stat.image ? (
                    // Remote URLs come from the database, so a plain img is used.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stat.image}
                      alt={category.label}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <Package className="size-6" />
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-base font-bold text-neutral-900">{category.label}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {category.description}
                </p>

                <span className="mt-3 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-brand/60 group-hover:text-brand-hover">
                  {stat.count} item{stat.count === 1 ? "" : "s"}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
