import { getAllAdminEquipments } from "@/lib/actions/equipments"
import AdminEquipmentsTable from "./equipments-table"

export const metadata = {
  title: "All Equipment Catalog | Admin Dashboard - RentalHub",
  description: "Review, approve, reject, update and manage all equipment listings.",
}

export default async function AllEquipmentsPage() {
  const items = await getAllAdminEquipments()

  return <AdminEquipmentsTable initialItems={items} />
}
