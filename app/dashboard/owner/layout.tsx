import { requireRole } from "@/lib/auth-guard"

/**
 * Equipment-owner dashboard — owners only. Customers and admins who open
 * one of these URLs are redirected to their own dashboard.
 */
export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("owner")
  return <>{children}</>
}
