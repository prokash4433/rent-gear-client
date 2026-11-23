"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Heart,
  Loader2,
  Mail,
  Package,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
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
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { UserAvatar } from "@/app/_components/dashboard/User-Avatar"
import { deleteUser, updateUserRole } from "@/lib/actions/users"
import type { AdminUser, UserRole, UserActivityStats } from "@/lib/types"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Rents machinery and creates bookings.",
  },
  {
    value: "owner",
    label: "Owner",
    description: "Lists equipment and manages inventory.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full administrative control.",
  },
]

const ROLE_BADGE: Record<UserRole, string> = {
  customer: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  owner: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  admin: "border-brand/40 bg-brand/15 text-brand-hover",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`
}

export default function ManageUserPanel({
  user,
  stats,
}: {
  user: AdminUser
  stats: UserActivityStats
}) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role)
  const [isSaving, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const saveRole = () => {
    if (selectedRole === user.role) return
    startTransition(async () => {
      try {
        const res = await updateUserRole(user.id, selectedRole)
        if (res.success) {
          toast.add({
            type: "success",
            title: "Role updated",
            description: `${user.name} is now ${selectedRole.toUpperCase()}.`,
          })
          router.refresh()
        } else {
          toast.add({
            type: "error",
            title: "Update failed",
            description: res.error || "Could not change the user role.",
            timeout: 7000,
          })
        }
      } catch {
        toast.add({
          type: "error",
          title: "Update error",
          description: "Could not reach the server. Please try again.",
          timeout: 7000,
        })
      }
    })
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await deleteUser(user.id)
      if (res.success) {
        toast.add({
          type: "success",
          title: "User removed",
          description: `Account for ${user.name} has been permanently deleted.`,
        })
        router.push("/dashboard/admin/all-users")
        router.refresh()
      } else {
        toast.add({
          type: "error",
          title: "Deletion failed",
          description: res.error || "Could not delete the user account.",
          timeout: 7000,
        })
      }
    } catch {
      toast.add({
        type: "error",
        title: "Deletion error",
        description: "Could not reach the server. Please try again.",
        timeout: 7000,
      })
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const statCards = [
    {
      label: "Total Bookings",
      value: String(stats.totalBookings),
      icon: CalendarCheck,
      tone: "bg-brand/20 text-brand-hover",
    },
    {
      label: "Active Rentals",
      value: String(stats.activeBookings),
      icon: Package,
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Total Spent",
      value: formatTaka(stats.totalSpent),
      icon: Wallet,
      tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Favorite Items",
      value: String(stats.favoriteItems),
      icon: Heart,
      tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6">
      {/* Back link */}
      <Link
        href="/dashboard/admin/all-users"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to All Users
      </Link>

      {/* Profile header */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              src={user.image}
              name={user.name}
              className="size-16 shrink-0 rounded-full ring-2 ring-brand"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground">
                  {user.name}
                </h1>
                <Badge variant="outline" className={cn("capitalize", ROLE_BADGE[user.role])}>
                  {user.role}
                </Badge>
                {user.emailVerified && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                {user.email}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Role management */}
          <div className="flex flex-col gap-2 sm:w-72">
            <Label htmlFor="role-select" className="text-xs font-semibold text-muted-foreground">
              Platform Role
            </Label>
            <div className="flex gap-2">
              <select
                id="role-select"
                aria-label="Select role"
                value={selectedRole}
                disabled={isSaving}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="h-10 flex-1 cursor-pointer rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-brand focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={saveRole}
                disabled={isSaving || selectedRole === user.role}
                className="cursor-pointer bg-brand font-semibold text-neutral-900 hover:bg-brand-hover"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Save
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ROLE_OPTIONS.find((option) => option.value === selectedRole)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity stats */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-2xl border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", stat.tone)}>
                <stat.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
              {stat.value}
            </p>
          </Card>
        ))}
      </section>

      {/* Danger zone */}
      <Card className="rounded-2xl border-rose-500/40 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600">
              <Trash2 className="size-4" />
            </span>
            Delete Account
          </CardTitle>
          <CardDescription className="text-xs">
            Permanently remove this user, their sessions and accounts. Bookings they
            created stay in the records.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4" />
            {user.email}
          </span>
          <Button
            type="button"
            onClick={() => setConfirmDelete(true)}
            variant="destructive"
            className="cursor-pointer"
          >
            <Trash2 className="size-4" />
            Delete User
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              The account for <strong>{user.name}</strong> ({user.email}) will be
              removed permanently. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
