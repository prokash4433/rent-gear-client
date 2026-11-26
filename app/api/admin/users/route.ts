import { NextResponse } from "next/server"
import { requireApiAdmin } from "@/lib/auth-guard"
import { getAllUsers, updateUserRole, deleteUser, updateUserDetails } from "@/lib/actions/users"
import type { UserRole } from "@/lib/types"

/**
 * GET /api/admin/users
 * Returns list of registered users.
 */
export async function GET() {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const users = await getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("GET /api/admin/users failed:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users
 * Updates a user's role or information.
 * Body: { userId: string, role?: UserRole, name?: string, email?: string }
 */
export async function PATCH(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const body = await req.json()
    const { userId, role, name, email } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (role) {
      const res = await updateUserRole(userId, role as UserRole)
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: `Role changed to ${role}` })
    }

    const res = await updateUserDetails(userId, { name, email })
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "User updated" })
  } catch (error) {
    console.error("PATCH /api/admin/users failed:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users
 * Deletes a user.
 * Body or query: ?userId=xxx
 */
export async function DELETE(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const { searchParams } = new URL(req.url)
    let userId = searchParams.get("userId")

    if (!userId) {
      const body = await req.json().catch(() => ({}))
      userId = body.userId
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const res = await deleteUser(userId)
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "User deleted" })
  } catch (error) {
    console.error("DELETE /api/admin/users failed:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
