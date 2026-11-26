import { apiFetch } from "@/lib/api-client"
import type { FavouriteDocument } from "@/lib/types"

/**
 * Favourites are renter-only on the API (`verifyRenter`), so these calls also
 * require the signed-in user to be a customer — an owner/admin receives a 403
 * which the callers already treat as "no favourites".
 */

/** All equipment one user has saved. */
export const getFavourites = async (userEmail: string): Promise<FavouriteDocument[]> => {
          const res = await apiFetch(
                    `/favourites?userEmail=${encodeURIComponent(userEmail)}`,
                    { cache: "no-store" }
          )
          if (!res.ok) {
                    throw new Error(`Favourites API returned ${res.status}`)
          }
          return res.json()
}

/** Save one equipment to the user's favourites. */
export const addFavourite = async (equipmentId: string, userEmail: string) => {
          const res = await apiFetch(`/favourites`, {
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
          const res = await apiFetch(`/favourites`, {
                    method: "DELETE",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ equipmentId, userEmail }),
          })
          if (!res.ok) {
                    throw new Error(`Favourites API returned ${res.status}`)
          }
          return res.json()
}
