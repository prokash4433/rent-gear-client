import { getAllUsers } from "@/lib/actions/users"
import UserTable from "../all-user/user-table"

export const metadata = {
  title: "All Users | Admin Dashboard - RentalHub",
  description: "View and manage all registered users, permissions, and roles.",
}

export default async function AllUsersPage() {
  const users = await getAllUsers()

  return <UserTable initialUsers={users} />
}
