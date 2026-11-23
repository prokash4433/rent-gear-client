import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getOwnerRentals } from "@/lib/data/owner"
import OwnerRentalsList from "./owner-rentals-list"

export const metadata = {
  title: "My Rentals - RentalHub",
  description: "View and manage all rental bookings for your equipment.",
}

export default async function MyRentalsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const rentals = await getOwnerRentals(session.user.email)

  return <OwnerRentalsList rentals={rentals} />
}
