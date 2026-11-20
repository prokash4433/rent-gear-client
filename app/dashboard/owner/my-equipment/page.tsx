// app/dashboard/owner/my-equipment/page.tsx
import { getEquipments } from "@/lib/api/equipments"
import EquipmentList from "./equipment-list"

export default async function AllEquipmentPage() {
  const equipments = await getEquipments()
  console.log("equipments data", equipments)

  return <EquipmentList initialItems={equipments} />
}