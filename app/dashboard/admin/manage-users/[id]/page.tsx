import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getUserById } from "@/lib/actions/users"
import { getUserActivityStats } from "@/lib/data/customer"
import ManageUserPanel from "./manage-user-panel"

export const metadata = {
  title: "Manage User | Admin Dashboard - RentalHub",
  description: "Review a user's profile, activity and change their platform role.",
}

/**
 * Admin-only user management page, reached from the Manage action in the
 * All Users table.
 */
const ManageUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const role = (session.user.role as string) ?? "customer"
  if (role !== "admin") {
    redirect(role === "owner" ? "/dashboard/owner" : "/dashboard/customer")
  }

  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  const stats = await getUserActivityStats(user.email)

  return <ManageUserPanel user={user} stats={stats} />
}

export default ManageUserPage
