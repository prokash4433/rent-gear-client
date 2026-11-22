"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { EquipmentCard } from "@/app/browse-equipments/equipment-card"
import { toast } from "@/components/ui/toast"
import {
  addFavourite,
  getFavourites,
  removeFavourite,
} from "@/lib/api/favourites"
import { useSession } from "@/lib/auth-client"
import type { EquipmentListItem } from "@/lib/types"

/**
 * Featured section-er card grid. Session diye View Details er dik thik kore:
 * login nai -> /sign-in, login ache -> /browse-equipments/[id].
 */
export function FeaturedEquipmentsGrid({
  items = [],
}: {
  items?: EquipmentListItem[]
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const email = session?.user?.email ?? ""

  const [favouriteIds, setFavouriteIds] = useState<string[]>([])

  // Signed-in user-er favourites load, jeno heart gula shuru theke thik dekhay.
  useEffect(() => {
    if (!email) return
    let cancelled = false
    getFavourites(email)
      .then((list) => {
        if (!cancelled) setFavouriteIds((list ?? []).map((f) => f.equipmentId))
      })
      .catch(() => { })
    return () => {
      cancelled = true
    }
  }, [email])

  // Browse page-er moto-i heart toggle (same API, same toast).
  async function toggleFavourite(item: EquipmentListItem) {
    if (!email) {
      toast.add({
        type: "error",
        title: "Sign in required",
        description: "Please sign in to save equipment to your favourites.",
      })
      return
    }

    const isFavourite = favouriteIds.includes(item.id)
    try {
      if (isFavourite) {
        await removeFavourite(item.id, email)
        setFavouriteIds((ids) => ids.filter((id) => id !== item.id))
        toast.add({
          type: "success",
          title: "Removed from favourites",
          description: `${item.name} was removed from your favourites.`,
        })
      } else {
        await addFavourite(item.id, email)
        setFavouriteIds((ids) => [...ids, item.id])
        toast.add({
          type: "success",
          title: "Added to favourites",
          description: `${item.name} was saved to your favourites.`,
        })
      }
    } catch {
      toast.add({
        type: "error",
        title: "Could not update favourites",
        description: "Something went wrong. Please try again.",
      })
    }
  }

  // Login nai hole sign-in page, thakle details page.
  // Session ekhono load hole details page-i bhalo — oi page nije check kore.
  function handleView(item: EquipmentListItem) {
    if (!session && !isPending) {
      router.push("/sign-in")
      return
    }
    router.push(`/browse-equipments/${item.id}`)
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted-foreground">
        No featured equipment available right now.
      </p>
    )
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <EquipmentCard
          key={item.id}
          item={item}
          isFavourite={favouriteIds.includes(item.id)}
          onToggleFavourite={toggleFavourite}
          onView={handleView}
        />
      ))}
    </div>
  )
}