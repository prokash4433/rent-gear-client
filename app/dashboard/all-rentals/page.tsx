import { requireRole } from "@/lib/auth-guard"
import AdminAllRentalsPage, { metadata } from "../admin/all-rentals/page"

export { metadata }

/**
 * Legacy alias of /dashboard/admin/all-rentals. It sits outside the admin
 * folder (so the admin layout guard does not cover it) and therefore does
 * the role check itself before rendering the shared admin page.
 */
const AllRentalsAliasPage = async () => {
  await requireRole("admin")
  return <AdminAllRentalsPage />
}

export default AllRentalsAliasPage
