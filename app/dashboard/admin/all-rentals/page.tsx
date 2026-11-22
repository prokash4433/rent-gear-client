import { getAllRentals } from "@/lib/actions/rentals"
import AdminRentalsList from "./rentals-list"

export const metadata = {
  title: "All Rentals & Bookings | Admin Dashboard - RentalHub",
  description: "Audit all equipment rentals, track payout totals, and manage booking statuses.",
}

export default async function AllRentalsPage() {
  const rentals = await getAllRentals()

  return <AdminRentalsList initialRentals={rentals} />
}
