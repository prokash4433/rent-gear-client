import { requireRole } from "@/lib/auth-guard"

/**
 * Admin dashboard — admins only. Any other signed-in role (and every
 * signed-out visitor) is redirected away before admin data is queried.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin")
  return <>{children}</>
}
