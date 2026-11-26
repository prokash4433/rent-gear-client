"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { getSession } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import type { AdminUser, UserRole } from "@/lib/types"

const usersCollection = db.collection("user")

/**
 * Admins only — every function in this file reads or mutates user accounts,
 * so the session role is checked here (not only on the admin pages) to stop
 * direct server-action calls from other roles.
 */
async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession()
  if (!session?.user?.email) {
    return { ok: false, error: "Sign in required" }
  }
  if (String(session.user.role ?? "customer") !== "admin") {
    return { ok: false, error: "Admins only" }
  }
  return { ok: true }
}

/** Maps one user document to the shape the admin UI renders. */
function mapUserDoc(user: Record<string, unknown>, index: number): AdminUser {
  const id = user._id ? String(user._id) : String(user.id ?? `user-${index}`)

  let createdAtStr = new Date().toISOString()
  if (user.createdAt) {
    if (user.createdAt instanceof Date) {
      createdAtStr = user.createdAt.toISOString()
    } else if (
      typeof user.createdAt === "string" ||
      typeof user.createdAt === "number"
    ) {
      createdAtStr = new Date(user.createdAt).toISOString()
    }
  }

  let updatedAtStr: string | undefined = undefined
  if (user.updatedAt) {
    if (user.updatedAt instanceof Date) {
      updatedAtStr = user.updatedAt.toISOString()
    } else if (
      typeof user.updatedAt === "string" ||
      typeof user.updatedAt === "number"
    ) {
      updatedAtStr = new Date(user.updatedAt).toISOString()
    }
  }

  return {
    id,
    name: String(user.name ?? "Anonymous User"),
    email: String(user.email ?? ""),
    role: (["customer", "owner", "admin"].includes(String(user.role))
      ? user.role
      : "customer") as UserRole,
    image: typeof user.image === "string" ? user.image : null,
    emailVerified: Boolean(user.emailVerified),
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  }
}

/**
 * Fetch all registered users from the MongoDB user collection.
 * Serializes all fields so they can be safely passed to client components.
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const gate = await requireAdmin()
  if (!gate.ok) throw new Error(gate.error)

  try {
    const rawUsers = await usersCollection.find({}).sort({ createdAt: -1 }).toArray()

    return rawUsers.map((user, index) =>
      mapUserDoc(user as unknown as Record<string, unknown>, index)
    )
  } catch (error) {
    console.error("Failed to fetch users from database:", error)
    return []
  }
}

/** Fetch a single user by their id (used by the Manage User page). */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  const gate = await requireAdmin()
  if (!gate.ok) throw new Error(gate.error)

  try {
    const filter = ObjectId.isValid(userId)
      ? { _id: new ObjectId(userId) }
      : { id: userId }

    const user = await usersCollection.findOne(filter)
    if (!user) return null

    return mapUserDoc(user as unknown as Record<string, unknown>, 0)
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error)
    return null
  }
}

/**
 * Change a user's role (Customer, Owner, Admin).
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  try {
    if (!["customer", "owner", "admin"].includes(newRole)) {
      return { success: false, error: "Invalid role specified" }
    }

    const filter = ObjectId.isValid(userId)
      ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }] }
      : { id: userId }

    const result = await usersCollection.updateOne(filter, {
      $set: {
        role: newRole,
        updatedAt: new Date(),
      },
    })

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" }
    }

    revalidatePath("/dashboard/admin/all-user")
    return { success: true, role: newRole }
  } catch (error) {
    console.error(`Failed to update role for user ${userId}:`, error)
    return { success: false, error: "Database update failed" }
  }
}

/**
 * Delete a user from the database. Also cleans up their active sessions.
 */
export async function deleteUser(userId: string) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  try {
    const filter = ObjectId.isValid(userId)
      ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }] }
      : { id: userId }

    const user = await usersCollection.findOne(filter)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const deleteResult = await usersCollection.deleteOne(filter)

    // Clean up related session or account records if any
    try {
      await db.collection("session").deleteMany({
        $or: [{ userId: userId }, { userId: user._id?.toString() }],
      })
      await db.collection("account").deleteMany({
        $or: [{ userId: userId }, { userId: user._id?.toString() }],
      })
    } catch {
      // Non-blocking cleanup failure
    }

    revalidatePath("/dashboard/admin/all-user")
    return { success: true, deletedCount: deleteResult.deletedCount }
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error)
    return { success: false, error: "Database deletion failed" }
  }
}

/**
 * Update user details (Name, Email, Role).
 */
export async function updateUserDetails(
  userId: string,
  data: { name?: string; email?: string; role?: UserRole }
) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  try {
    const filter = ObjectId.isValid(userId)
      ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }] }
      : { id: userId }

    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.name !== undefined && data.name.trim()) {
      updateDoc.name = data.name.trim()
    }
    if (data.email !== undefined && data.email.trim()) {
      updateDoc.email = data.email.trim().toLowerCase()
    }
    if (data.role && ["customer", "owner", "admin"].includes(data.role)) {
      updateDoc.role = data.role
    }

    const result = await usersCollection.updateOne(filter, { $set: updateDoc })

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" }
    }

    revalidatePath("/dashboard/admin/all-user")
    return { success: true }
  } catch (error) {
    console.error(`Failed to update user details for ${userId}:`, error)
    return { success: false, error: "Update failed" }
  }
}
