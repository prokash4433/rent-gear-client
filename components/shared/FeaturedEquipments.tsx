import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import { getEquipments, normalizeEquipments } from "@/lib/api/equipments"
import type { EquipmentListItem } from "@/lib/types"
import { FeaturedEquipmentsGrid } from "./FeaturedEquipmentsGrid"

/**
 * Homepage er featured section: approved equipment theke
 * (API-er ?limit=6) shudhu 6ta item dekhay.
 */
const FeaturedEquipmentsPage = async () => {
  let items: EquipmentListItem[] = []

  try {
    const raw = await getEquipments("status=approved&limit=6")

    // ---------- DEBUG (pore muche dio) ----------
    console.log("[Featured] RAW type:", Array.isArray(raw) ? "array" : typeof raw)
    console.log("[Featured] RAW:", JSON.stringify(raw, null, 2))
    // --------------------------------------------

    items = normalizeEquipments(raw)

    console.log("[Featured] NORMALIZED count:", items.length)
  } catch (err) {
    console.error("[Featured] FETCH ERROR:", err)
    items = []
  }

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

export default FeaturedEquipmentsPage