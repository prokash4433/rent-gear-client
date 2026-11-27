import { apiFetch } from "@/lib/api-client"
import type { EquipmentDocument, EquipmentListItem, RawEquipment } from "@/lib/types"

/**
 * Reads from the Express API. `GET /equipments` is public (the All
 * Equipment page works signed-out); pass `token` when a caller already has
 * one — in the browser it is resolved from the session automatically.
 * A failed/forbidden request resolves to an empty list / null so a page
 * never crashes.
 */
export const getEquipments = async (
  query = "",
  token?: string | null
): Promise<RawEquipment[]> => {
  try {
    const res = await apiFetch(`/equipments?${query}`, { cache: "no-store" }, { token })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * One equipment by id (details page). Returns null when the id is invalid
 * or nothing matched, so the page can show its not-found state.
 */
export const getEquipmentById = async (
  id: string,
  token?: string | null
): Promise<EquipmentDocument | null> => {
  try {
    const res = await apiFetch(
      `/equipments/${encodeURIComponent(id)}`,
      { cache: "no-store" },
      { token }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Server theke asha raw data ke page-er kaaj moto kore toiri kore:
 * - id: _id theke (kokhono undefined hobe na)
 * - rentalPrice / quantity: string e (API number dileo kaj korbe)
 */
export function normalizeEquipments(raw: RawEquipment[]): EquipmentListItem[] {
          return raw.map((item, index) => ({
                    ...item,
                    id: String(item._id ?? `equipment-${index}`),
                    rentalPrice: String(item.rentalPrice ?? ""),
                    quantity: String(item.quantity ?? "0"),
          })) as EquipmentListItem[]
}
