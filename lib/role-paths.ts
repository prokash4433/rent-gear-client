import type { UserRole } from "@/lib/types"

/** Dashboard home for each role. */
export const ROLE_HOME: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
}

/**
 * Where a user lands right after signing in or signing up: their own
 * role's dashboard. Unknown/missing roles fall back to the customer
 * dashboard (sign-up can only ever create customer/owner accounts).
 *
 * Used by the auth forms (client), the guards (server) and /dashboard —
 * so it must stay free of server-only imports.
 */
export function dashboardPathFor(role: unknown): string {
  return ROLE_HOME[role as UserRole] ?? ROLE_HOME.customer
}
