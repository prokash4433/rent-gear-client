import type { FavouriteDocument } from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

/** All equipment one user has saved. */
export const getFavourites = async (userEmail: string): Promise<FavouriteDocument[]> => {
          const res = await fetch(
                    `${BASE_URL}/favourites?userEmail=${encodeURIComponent(userEmail)}`,
                    { cache: "no-store" }
          )
          if (!res.ok) {
                    throw new Error(`Favourites API returned ${res.status}`)
          }
          return res.json()
}

/** Save one equipment to the user's favourites. */
export const addFavourite = async (equipmentId: string, userEmail: string) => {
          const res = await fetch(`${BASE_URL}/favourites`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ equipmentId, userEmail }),
          })
          if (!res.ok) {
                    throw new Error(`Favourites API returned ${res.status}`)
          }
          return res.json()
}

/** Remove one equipment from the user's favourites. */
export const removeFavourite = async (equipmentId: string, userEmail: string) => {
          const res = await fetch(`${BASE_URL}/favourites`, {
                    method: "DELETE",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ equipmentId, userEmail }),
          })
          if (!res.ok) {
                    throw new Error(`Favourites API returned ${res.status}`)
          }
          return res.json()
}
