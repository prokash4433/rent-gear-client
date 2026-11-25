import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import AddEquipmentForm from "./add-equipment-form"

export const metadata = {
  title: "Add Equipment - RentalHub",
  description: "Publish a new equipment listing to your rental catalogue.",
}

export default async function AddEquipmentPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  // The owner's email comes from the server session so the listing is
  // always attributed to the signed-in owner, even before client hydration.
  return <AddEquipmentForm ownerEmail={session.user.email} />
}
