import { getAllUsers } from "@/lib/actions/users"
import UserTable from "./user-table"

export const metadata = {
  title: "All Users | Admin Dashboard - RentalHub",
  description: "View and manage all registered users, permissions, and roles.",
}

export default async function AllUserPage() {
  const users = await getAllUsers()

  return <UserTable initialUsers={users} />
}
