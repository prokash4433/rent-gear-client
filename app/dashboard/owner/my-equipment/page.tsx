import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getOwnerEquipments } from "@/lib/data/owner"
import EquipmentImageGrid from "./equipment-image-grid"

export const metadata = {
  title: "My Equipment - RentalHub",
  description: "View all your listed equipment with images.",
}

export default async function MyEquipmentPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const equipments = await getOwnerEquipments(session.user.email)

  return <EquipmentImageGrid equipments={equipments} />
}
