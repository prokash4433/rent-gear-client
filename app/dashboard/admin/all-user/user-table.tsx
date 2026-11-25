"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { UserAvatar } from "@/app/_components/dashboard/User-Avatar"
import { updateUserRole, deleteUser } from "@/lib/actions/users"
import type { AdminUser, UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"

const roleStyles: Record<
  UserRole,
  { badge: string; ring: string; icon: typeof Users; label: string }
> = {
  customer: {
    badge: "border-sky-500/20 bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    ring: "ring-sky-400/60",
    icon: Users,
    label: "Customer",
  },
  owner: {
    badge: "border-amber-500/20 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "ring-amber-400/60",
    icon: UserCheck,
    label: "Owner",
  },
  admin: {
    badge: "border-purple-500/20 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    ring: "ring-purple-400/60",
    icon: ShieldCheck,
    label: "Admin",
  },
}

const ROLES: UserRole[] = ["customer", "owner", "admin"]

const FILTERS: { key: "all" | UserRole; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "owner", label: "Owners" },
  { key: "admin", label: "Admins" },
]

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return "Recent"
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Recent"
  }
}

function formatTime(dateString: string) {
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function UserTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all")
  const [isPending, startTransition] = useTransition()

  // State for modals
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer")
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

  // Counts
  const totalCount = users.length
  const counts: Record<"all" | UserRole, number> = {
    all: totalCount,
    customer: users.filter((u) => u.role === "customer").length,
    owner: users.filter((u) => u.role === "owner").length,
    admin: users.filter((u) => u.role === "admin").length,
  }

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      q === "" ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    return matchesRole && matchesQuery
  })

  // Handle Role Change
  async function handleRoleChange(user: AdminUser, newRole: UserRole) {
    if (user.role === newRole) return

    setIsUpdatingRole(true)
    startTransition(async () => {
      try {
        const res = await updateUserRole(user.id, newRole)
        if (res.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
          )
          toast.add({
            type: "success",
            title: "Role updated",
            description: `${user.name}'s role was changed to ${newRole.toUpperCase()}.`,
          })
          setRoleModalUser(null)
        } else {
          toast.add({
            type: "error",
            title: "Update failed",
            description: res.error || "Could not change user role.",
          })
        }
      } catch {
        toast.add({
          type: "error",
          title: "Update error",
          description: "An unexpected error occurred.",
        })
      } finally {
        setIsUpdatingRole(false)
      }
    })
  }

  // Handle Delete User
  async function handleDeleteUser() {
    if (!deleteCandidate) return

    setIsDeleting(true)
    startTransition(async () => {
      try {
        const res = await deleteUser(deleteCandidate.id)
        if (res.success) {
          setUsers((prev) => prev.filter((u) => u.id !== deleteCandidate.id))
          toast.add({
            type: "success",
            title: "User removed",
            description: `Account for ${deleteCandidate.name} has been permanently deleted.`,
          })
          setDeleteCandidate(null)
        } else {
          toast.add({
            type: "error",
            title: "Deletion failed",
            description: res.error || "Could not delete user account.",
          })
        }
      } catch {
        toast.add({
          type: "error",
          title: "Deletion error",
          description: "An error occurred while deleting the user.",
        })
      } finally {
        setIsDeleting(false)
      }
    })
  }

  const statCards = [
    {
      label: "Total Users",
      value: counts.all,
      icon: Users,
      tone: "bg-brand/20 text-brand-hover",
    },
    {
      label: "Customers",
      value: counts.customer,
      icon: Users,
      tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Owners",
      value: counts.owner,
      icon: UserCheck,
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Admins",
      value: counts.admin,
      icon: ShieldCheck,
      tone: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Back to overview */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Admin Overview
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="rounded-2xl border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <span className={cn("flex size-8 items-center justify-center rounded-xl", s.tone)}>
                <s.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-gradient-to-r from-brand/10 via-transparent to-transparent pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand/20 text-brand-hover">
                <UserCog className="size-5" />
              </span>
              Registered Platform Users
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {totalCount}
              </span>
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm text-muted-foreground">
              View user accounts, adjust access roles, and manage member privileges.
            </CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setRoleFilter(f.key)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  roleFilter === f.key
                    ? "bg-brand font-semibold text-neutral-900 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f.label} ({counts[f.key]})
              </button>
            ))}
          </div>
        </CardHeader>

        {/* Search controls */}
        <div className="flex flex-col gap-2 border-b border-border/50 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl pl-9 pr-14 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> users
          </p>
        </div>

        {/* Users Table */}
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserX className="size-7" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try searching with a different name or email."
                  : "No users registered under this role filter yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-5 text-[11px] font-bold uppercase tracking-wider">
                      User
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                      Role
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                      Joined
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">
                      Change Role
                    </TableHead>
                    <TableHead className="pr-5 text-right text-[11px] font-bold uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = roleStyles[user.role] ?? roleStyles.customer

                    return (
                      <TableRow
                        key={user.id}
                        className="group transition-colors hover:bg-brand/5"
                      >
                        {/* Name + Avatar */}
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={user.image}
                              name={user.name}
                              className={cn(
                                "size-10 rounded-full ring-2 ring-offset-2 ring-offset-card",
                                roleInfo.ring
                              )}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {user.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-muted-foreground">
                                #{user.id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1 rounded-full px-2.5 font-semibold", roleInfo.badge)}
                          >
                            <roleInfo.icon className="size-3" />
                            {roleInfo.label}
                          </Badge>
                        </TableCell>

                        {/* Registration Date */}
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-foreground">
                              {formatDate(user.createdAt)}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(user.createdAt)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Quick Role Change Selector */}
                        <TableCell>
                          <div className="relative inline-block">
                            <select
                              aria-label={`Change role for ${user.name}`}
                              value={user.role}
                              disabled={isPending}
                              onChange={(e) =>
                                handleRoleChange(user, e.target.value as UserRole)
                              }
                              className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {roleStyles[r].label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View details"
                              aria-label={`View details of ${user.name}`}
                              onClick={() => setViewUser(user)}
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:text-foreground"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete user"
                              aria-label={`Delete ${user.name}`}
                              onClick={() => setDeleteCandidate(user)}
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Change Role Dialog (opened from View Details) ---------- */}
      <Dialog
        open={roleModalUser !== null}
        onOpenChange={(open) => {
          if (!open) setRoleModalUser(null)
        }}
      >
        {roleModalUser && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-brand" />
                Change User Role
              </DialogTitle>
              <DialogDescription>
                Assign a platform role to <strong>{roleModalUser.name}</strong> ({roleModalUser.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2">
              <Label className="text-xs font-semibold text-muted-foreground">Select New Role</Label>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map((r) => {
                  const info = roleStyles[r]
                  const isSelected = selectedRole === r

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all",
                        isSelected
                          ? "border-brand bg-brand/10 ring-1 ring-brand"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-8 items-center justify-center rounded-lg",
                            isSelected ? "bg-brand text-neutral-900" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <info.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold capitalize text-foreground">{r}</p>
                          <p className="text-xs text-muted-foreground">
                            {r === "customer" && "Rents machinery, creates bookings, submits reviews."}
                            {r === "owner" && "Lists equipment, manages inventory, sets rental rates."}
                            {r === "admin" && "Full administrative control, listing approvals, user moderation."}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 shrink-0 text-brand-hover" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button" disabled={isUpdatingRole}>
                    Cancel
                  </Button>
                }
              />
              <Button
                type="button"
                disabled={isUpdatingRole || selectedRole === roleModalUser.role}
                onClick={() => handleRoleChange(roleModalUser, selectedRole)}
                className="bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- View User Details Dialog ---------- */}
      <Dialog
        open={viewUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewUser(null)
        }}
      >
        {viewUser && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>User Profile Details</DialogTitle>
              <DialogDescription>
                Detailed overview of account credentials and activity.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-2">
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <UserAvatar
                  src={viewUser.image}
                  name={viewUser.name}
                  className="size-16 rounded-full ring-2 ring-brand"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-foreground">{viewUser.name}</h4>
                  <p className="truncate text-sm text-muted-foreground">{viewUser.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={roleStyles[viewUser.role].badge}>
                      {roleStyles[viewUser.role].label}
                    </Badge>
                    {viewUser.emailVerified ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Standard Account</span>
                    )}
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 p-3">
                  <dt className="text-xs font-medium text-muted-foreground">User ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-foreground">{viewUser.id}</dd>
                </div>

                <div className="rounded-lg border border-border/50 p-3">
                  <dt className="text-xs font-medium text-muted-foreground">Assigned Role</dt>
                  <dd className="mt-1 text-sm font-semibold capitalize text-foreground">{viewUser.role}</dd>
                </div>

                <div className="rounded-lg border border-border/50 p-3">
                  <dt className="text-xs font-medium text-muted-foreground">Registration Date</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {formatDate(viewUser.createdAt)}
                  </dd>
                </div>

                <div className="rounded-lg border border-border/50 p-3">
                  <dt className="text-xs font-medium text-muted-foreground">Registration Time</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {formatTime(viewUser.createdAt) || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline">Close</Button>} />
              <Button
                onClick={() => {
                  const target = viewUser
                  setViewUser(null)
                  setSelectedRole(target.role)
                  setRoleModalUser(target)
                }}
                className="bg-brand text-neutral-900 hover:bg-brand-hover"
              >
                Change Role
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ---------- Delete User Confirmation ---------- */}
      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteCandidate?.name}</strong> (
              {deleteCandidate?.email})? This action cannot be undone and will revoke their platform access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteUser}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}