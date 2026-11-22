import Link from "next/link"
import {
  Boxes,
  Clock,
  Package,
  Shield,
  Users,
  UserCheck,
  ArrowRight,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllAdminEquipments } from "@/lib/actions/equipments"
import { getAllUsers } from "@/lib/actions/users"

export const metadata = {
  title: "Admin Overview - RentalHub",
  description: "Administrative command center for platform operations, users, and equipment.",
}

export default async function AdminDashboardPage() {
  const [equipments, users] = await Promise.all([
    getAllAdminEquipments(),
    getAllUsers(),
  ])

  const pendingEquipments = equipments.filter((e) => (e.status ?? "pending") === "pending")
  const approvedEquipments = equipments.filter((e) => e.status === "approved")
  const customerCount = users.filter((u) => u.role === "customer").length
  const ownerCount = users.filter((u) => u.role === "owner").length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-brand/10 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-hover">
              <Shield className="size-3.5" />
              Platform Administration
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Admin Overview Dashboard
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Monitor listings approval workflow, manage user accounts, assign roles, and track platform metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/admin/all-equipment" />}
              className="bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
            >
              <Package className="mr-1.5 size-4" />
              Review Equipment ({pendingEquipments.length})
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/admin/all-user" />}
              variant="outline"
              className="font-medium"
            >
              <Users className="mr-1.5 size-4" />
              Manage Users ({users.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border-border/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Listings</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/20 text-brand-hover">
              <Boxes className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{equipments.length}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Approvals</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pendingEquipments.length}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Users</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{users.length}</p>
        </Card>

        <Card className="rounded-2xl border-border/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Verified Owners</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{ownerCount}</p>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* All Equipment Card */}
        <Card className="rounded-2xl border-border/70 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/20 text-brand-hover">
                <Package className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">All Equipment Catalog</h3>
                <p className="text-sm text-muted-foreground">Review, approve, reject, or edit listings</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {pendingEquipments.length > 0 ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ⚠️ {pendingEquipments.length} submission(s) pending review
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ All listings reviewed ({approvedEquipments.length} approved)
              </span>
            )}
          </p>
          <div className="mt-5">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/admin/all-equipment" />}
              className="gap-2 bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
            >
              Open Equipment Catalog
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>

        {/* All Users Card */}
        <Card className="rounded-2xl border-border/70 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Users className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">All Users Management</h3>
                <p className="text-sm text-muted-foreground">Manage user accounts and roles</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <span>
              {customerCount} Customer(s) · {ownerCount} Owner(s) · {users.length - customerCount - ownerCount} Admin(s)
            </span>
          </p>
          <div className="mt-5">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/admin/all-user" />}
              variant="outline"
              className="gap-2 font-medium"
            >
              Open Users Table
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
