import { requireRole } from "@/lib/auth-guard"

/**
 * Renter (customer) dashboard — customers only. A signed-in owner or admin
 * who opens one of these URLs is redirected to their own dashboard, so
 * URL manipulation cannot reach renter-only data.
 */
export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("customer")
  return <>{children}</>
}
