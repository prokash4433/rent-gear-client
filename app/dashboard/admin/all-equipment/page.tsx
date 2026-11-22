import { getAllAdminEquipments } from "@/lib/actions/equipments"
import AdminEquipmentTable from "./equipment-table"

export const metadata = {
  title: "All Equipment Catalog | Admin Dashboard - RentalHub",
  description: "Review, approve, reject, update and manage all equipment listings.",
}

export default async function AllEquipmentPage() {
  const items = await getAllAdminEquipments()

  return <AdminEquipmentTable initialItems={items} />
}
