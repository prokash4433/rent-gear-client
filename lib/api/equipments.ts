import { RawEquipment } from "@/app/dashboard/owner/my-equipment/equipment-list";
import type { EquipmentListItem } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export const getEquipments = async (query = ''): Promise<RawEquipment[]> =>{
          const res = await fetch(`${BASE_URL}/equipments?${query}`, { cache: "no-store" });
          return res.json();
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