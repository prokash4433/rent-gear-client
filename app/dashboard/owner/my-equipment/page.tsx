import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import EquipmentImageGrid from "./equipment-image-grid"

export const metadata = {
  title: "My Equipment - RentalHub",
  description: "View all your listed equipment with images.",
}

export default async function MyEquipmentPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  // Fetch directly from MongoDB so we always get only this owner's equipment
  const docs = await db
    .collection("equipments")
    .find({ ownerEmail: session.user.email })
    .sort({ _id: -1 })
    .toArray()

  // Serialize: convert ObjectId and Date fields to plain strings
  const equipments = docs.map((doc) => ({
    ...doc,
    _id: String(doc._id),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  }))

  return <EquipmentImageGrid equipments={equipments} />
}
