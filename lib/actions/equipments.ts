"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { apiFetch } from "@/lib/api-client"
import { getSession } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { getServerAccessToken } from "@/lib/server-token"
import type {
  CreateEquipmentResult,
  EquipmentListItem,
  EquipmentPayload,
  EquipmentStatus,
} from "@/lib/types"

const equipmentsCollection = db.collection("equipments")

/** Every route that renders equipment data, so a change shows up everywhere. */
function revalidateEquipmentPaths() {
  revalidatePath("/dashboard/admin/all-equipments")
  revalidatePath("/dashboard/admin/all-equipment")
  revalidatePath("/dashboard/owner")
  revalidatePath("/dashboard/owner/my-equipment")
  revalidatePath("/dashboard/owner/analytics")
  revalidatePath("/browse-equipments")
}

/**
 * Authorization helpers — these run BEFORE any data is read or written.
 *
 * The Express API enforces the same rules behind the JWT
 * (`middleware/verifyToken.js`), but these server actions can also talk to
 * MongoDB directly, so they must never rely on the API alone.
 */
type GuardFailure = { ok: false; error: string }
type SessionOf = NonNullable<Awaited<ReturnType<typeof getSession>>>
/** `T` defaults to `unknown` (not `never`, which would collapse the type). */
type GuardSuccess<T = unknown> = { ok: true; session: SessionOf } & T

/** Signed in? Otherwise the mutation/read is refused. */
async function requireSignedIn(): Promise<GuardSuccess | GuardFailure> {
  const session = await getSession()
  if (!session?.user?.email) {
    return { ok: false, error: "Sign in required" }
  }
  return { ok: true, session }
}

/** Signed in with one of the given roles? Otherwise refused. */
async function requireRole(
  ...roles: string[]
): Promise<GuardSuccess | GuardFailure> {
  const gate = await requireSignedIn()
  if (!gate.ok) return gate

  const role = String(gate.session.user.role ?? "customer")
  if (!roles.includes(role)) {
    return { ok: false, error: "You are not allowed to perform this action" }
  }
  return gate
}

/** Loads a listing by id (ObjectId or legacy string id). */
async function findEquipment(equipmentId: string) {
  const filter = ObjectId.isValid(equipmentId)
    ? { $or: [{ _id: new ObjectId(equipmentId) }, { id: equipmentId }] }
    : { id: equipmentId }
  return equipmentsCollection.findOne(filter)
}

/**
 * Admins may touch any listing; everyone else only their own
 * (matched on `ownerEmail`, the same rule the Express API applies).
 */
async function requireEquipmentManager(equipmentId: string): Promise<
  GuardSuccess<{ equipment: NonNullable<Awaited<ReturnType<typeof findEquipment>>> }> | GuardFailure
> {
  const gate = await requireSignedIn()
  if (!gate.ok) return gate

  const equipment = await findEquipment(equipmentId)
  if (!equipment) return { ok: false, error: "Equipment not found" }

  const role = String(gate.session.user.role ?? "customer")
  const ownerEmail = String(equipment.ownerEmail ?? "").trim().toLowerCase()
  const isOwner =
    ownerEmail !== "" &&
    ownerEmail === String(gate.session.user.email).trim().toLowerCase()

  if (role !== "admin" && !isOwner) {
    return { ok: false, error: "You can only manage your own equipment" }
  }
  return { ok: true, session: gate.session, equipment }
}

/**
 * Normalizes MongoDB / API documents to safe serialized EquipmentListItem objects.
 */
function normalizeDoc(item: Record<string, unknown>, index: number): EquipmentListItem {
  const rawId = item._id ? String(item._id) : String(item.id ?? `equipment-${index}`)
  
  let imageUrls = ""
  if (Array.isArray(item.imageUrls)) {
    imageUrls = item.imageUrls.join("\n")
  } else if (typeof item.imageUrls === "string") {
    imageUrls = item.imageUrls
  }

  const status: EquipmentStatus =
    item.status === "approved" || item.status === "rejected" || item.status === "pending"
      ? item.status
      : "pending"

  return {
    id: rawId,
    name: String(item.name ?? "Untitled Equipment"),
    category: String(item.category ?? "construction"),
    description: String(item.description ?? ""),
    rentalPrice: String(item.rentalPrice ?? "0"),
    rentalType: String(item.rentalType ?? "daily"),
    quantity: String(item.quantity ?? "0"),
    brand: String(item.brand ?? ""),
    model: String(item.model ?? ""),
    condition: String(item.condition ?? "Good"),
    location: String(item.location ?? ""),
    imageUrls,
    terms: String(item.terms ?? ""),
    status,
    ownerEmail: String(item.ownerEmail ?? ""),
  }
}

/**
 * Fetch all equipment listings for Admin review.
 * Admin only — a non-admin caller gets an error instead of the data, and
 * the same guard also protects the direct MongoDB fallback.
 */
export async function getAllAdminEquipments(): Promise<EquipmentListItem[]> {
  const gate = await requireRole("admin")
  if (!gate.ok) throw new Error(gate.error)

  // 1. Try Express API (with this request's JWT)
  try {
    const token = await getServerAccessToken()
    const res = await apiFetch("/equipments", { cache: "no-store" }, { token })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((item, index) => normalizeDoc(item, index))
      }
    }
  } catch {
    // Express API is not reachable; fall back directly to MongoDB
  }

  // 2. Direct MongoDB fallback (already admin-checked above)
  try {
    const items = await equipmentsCollection.find({}).sort({ _id: -1 }).toArray()
    return items.map((item, index) => normalizeDoc(item, index))
  } catch (error) {
    console.error("Failed to query equipments collection:", error)
    return []
  }
}

/**
 * Create a listing. Owners only (the Express API requires the `owner` role),
 * and `ownerEmail` is always taken from the session — never from the form —
 * so a listing can never be attributed to someone else.
 */
export const createEquipment = async (
  data: EquipmentPayload
): Promise<CreateEquipmentResult> => {
  const gate = await requireRole("owner")
  if (!gate.ok) {
    return { acknowledged: false, insertedId: "", error: gate.error }
  }

  const ownerEmail = String(gate.session.user.email)
  const payload = { ...data, ownerEmail }

  // 1. Try Express API (with this request's JWT)
  try {
    const token = await getServerAccessToken()
    const res = await apiFetch(
      "/equipments",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
      { token }
    )

    if (res.ok) {
      return res.json()
    }
  } catch {
    // Fall back to direct MongoDB insertion
  }

  const result = await equipmentsCollection.insertOne({
    ...payload,
    status: "pending",
    createdAt: new Date(),
  })

  return {
    acknowledged: result.acknowledged,
    insertedId: result.insertedId.toString(),
  }
}

/**
 * Delete an equipment listing by its ID — admin or the listed owner only.
 */
export const deleteEquipment = async (equipmentId: string) => {
  const gate = await requireEquipmentManager(equipmentId)
  if (!gate.ok) {
    return { acknowledged: false, deletedCount: 0, error: gate.error }
  }

  let apiSucceeded = false

  // 1. Try Express API (with this request's JWT)
  try {
    const token = await getServerAccessToken()
    const res = await apiFetch(
      `/equipments/${equipmentId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId }),
      },
      { token }
    )
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // API down or error
  }

  // 2. Direct MongoDB deletion (ownership already verified above)
  try {
    const filter = ObjectId.isValid(equipmentId)
      ? { $or: [{ _id: new ObjectId(equipmentId) }, { id: equipmentId }] }
      : { id: equipmentId }

    const dbResult = await equipmentsCollection.deleteOne(filter)
    revalidateEquipmentPaths()

    return {
      acknowledged: true,
      deletedCount: dbResult.deletedCount || (apiSucceeded ? 1 : 0),
    }
  } catch (error) {
    console.error("Direct MongoDB delete failed:", error)
    if (apiSucceeded) {
      return { acknowledged: true, deletedCount: 1 }
    }
    throw error
  }
}

/**
 * Update equipment properties (price, quantity, name, etc.) —
 * admin or the listed owner only.
 */
export const updateEquipment = async (
  equipmentId: string,
  data: { rentalPrice: string; quantity: string } & Partial<EquipmentPayload>
) => {
  const gate = await requireEquipmentManager(equipmentId)
  if (!gate.ok) {
    return { acknowledged: false, modifiedCount: 0, error: gate.error }
  }

  let apiSucceeded = false

  // 1. Try Express API (with this request's JWT)
  try {
    const token = await getServerAccessToken()
    const res = await apiFetch(
      `/equipments/${equipmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      { token }
    )
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // API down or error
  }

  // 2. Direct MongoDB update (ownership already verified above)
  try {
    const filter = ObjectId.isValid(equipmentId)
      ? { $or: [{ _id: new ObjectId(equipmentId) }, { id: equipmentId }] }
      : { id: equipmentId }

    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    if (data.rentalPrice !== undefined) updateDoc.rentalPrice = data.rentalPrice
    if (data.quantity !== undefined) updateDoc.quantity = data.quantity
    if (data.name !== undefined) updateDoc.name = data.name
    if (data.category !== undefined) updateDoc.category = data.category
    if (data.description !== undefined) updateDoc.description = data.description
    if (data.condition !== undefined) updateDoc.condition = data.condition
    if (data.location !== undefined) updateDoc.location = data.location

    const result = await equipmentsCollection.updateOne(filter, {
      $set: updateDoc,
    })
    revalidateEquipmentPaths()

    return { acknowledged: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    console.error("Direct MongoDB update failed:", error)
    if (apiSucceeded) {
      return { acknowledged: true, modifiedCount: 1 }
    }
    throw error
  }
}

/**
 * Update an equipment's approval status (approved, rejected, pending) —
 * admins only, matching the Express PATCH rule.
 */
export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus
) {
  const gate = await requireRole("admin")
  if (!gate.ok) {
    return { success: false as const, error: gate.error }
  }

  let apiSucceeded = false

  // 1. Try Express API (with this request's JWT)
  try {
    const token = await getServerAccessToken()
    const res = await apiFetch(
      `/equipments/${equipmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
      { token }
    )
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // Express API down or error
  }

  // 2. Direct MongoDB update (admin role already verified above)
  try {
    const filter = ObjectId.isValid(equipmentId)
      ? { $or: [{ _id: new ObjectId(equipmentId) }, { id: equipmentId }] }
      : { id: equipmentId }

    const result = await equipmentsCollection.updateOne(filter, {
      $set: {
        status,
        updatedAt: new Date(),
      },
    })

    revalidateEquipmentPaths()

    return {
      success: true,
      status,
      acknowledged: result.acknowledged || apiSucceeded,
    }
  } catch (error) {
    console.error("Direct MongoDB status update failed:", error)
    if (apiSucceeded) {
      return { success: true, status, acknowledged: true }
    }
    return { success: false, error: "Failed to update equipment status" }
  }
}
