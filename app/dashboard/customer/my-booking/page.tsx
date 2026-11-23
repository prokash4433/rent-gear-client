import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getMyBookings } from "@/lib/data/customer"
import MyBookingsList from "./my-bookings-list"

export const metadata = {
  title: "My Bookings - RentalHub",
  description: "Track, pay for, and review all your equipment rental bookings.",
}

/**
 * My Bookings — server-rendered so the list always reflects the database
 * (cancelling or paying re-renders through router.refresh()).
 */
const MyBookingPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const params = await searchParams
  const cancelled = params.cancelled === "1"

  const bookings = await getMyBookings(session.user.email)

  return <MyBookingsList bookings={bookings} cancelled={cancelled} />
}

export default MyBookingPage
