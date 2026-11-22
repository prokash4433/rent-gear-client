"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { db } from "@/lib/db"
import type {
  CreateEquipmentResult,
  EquipmentListItem,
  EquipmentPayload,
  EquipmentStatus,
} from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
const equipmentsCollection = db.collection("equipments")

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
 * Tries the Express backend first, and falls back seamlessly to direct MongoDB access.
 */
export async function getAllAdminEquipments(): Promise<EquipmentListItem[]> {
  // 1. Try Express API
  try {
    const res = await fetch(`${BASE_URL}/equipments`, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((item, index) => normalizeDoc(item, index))
      }
    }
  } catch {
    // Express API is not reachable; fall back directly to MongoDB
  }

  // 2. Direct MongoDB fallback
  try {
    const items = await equipmentsCollection.find({}).sort({ _id: -1 }).toArray()
    return items.map((item, index) => normalizeDoc(item, index))
  } catch (error) {
    console.error("Failed to query equipments collection:", error)
    return []
  }
}

export const createEquipment = async (
  data: EquipmentPayload
): Promise<CreateEquipmentResult> => {
  // 1. Try Express API
  try {
    const res = await fetch(`${BASE_URL}/equipments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      return res.json()
    }
  } catch {
    // Fall back to direct MongoDB insertion
  }

  const result = await equipmentsCollection.insertOne({
    ...data,
    status: "pending",
    createdAt: new Date(),
  })

  return {
    acknowledged: result.acknowledged,
    insertedId: result.insertedId.toString(),
  }
}

/**
 * Delete an equipment listing by its ID.
 */
export const deleteEquipment = async (equipmentId: string) => {
  let apiSucceeded = false

  // 1. Try Express API
  try {
    const res = await fetch(`${BASE_URL}/equipments/${equipmentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId }),
    })
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // API down or error
  }

  // 2. Direct MongoDB deletion
  try {
    const filter = ObjectId.isValid(equipmentId)
      ? { $or: [{ _id: new ObjectId(equipmentId) }, { id: equipmentId }] }
      : { id: equipmentId }

    const dbResult = await equipmentsCollection.deleteOne(filter)
    revalidatePath("/dashboard/admin/all-equipment")
    revalidatePath("/dashboard/owner/my-equipment")
    revalidatePath("/browse-equipments")

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
 * Update equipment properties (price, quantity, name, etc.).
 */
export const updateEquipment = async (
  equipmentId: string,
  data: { rentalPrice: string; quantity: string } & Partial<EquipmentPayload>
) => {
  let apiSucceeded = false

  // 1. Try Express API
  try {
    const res = await fetch(`${BASE_URL}/equipments/${equipmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // API down or error
  }

  // 2. Direct MongoDB update
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

    await equipmentsCollection.updateOne(filter, { $set: updateDoc })
    revalidatePath("/dashboard/admin/all-equipment")
    revalidatePath("/dashboard/owner/my-equipment")
    revalidatePath("/browse-equipments")

    return { acknowledged: true, modifiedCount: 1 }
  } catch (error) {
    console.error("Direct MongoDB update failed:", error)
    if (apiSucceeded) {
      return { acknowledged: true, modifiedCount: 1 }
    }
    throw error
  }
}

/**
 * Update an equipment's approval status (approved, rejected, pending).
 */
export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus
) {
  let apiSucceeded = false

  // 1. Try Express API
  try {
    const res = await fetch(`${BASE_URL}/equipments/${equipmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      apiSucceeded = true
    }
  } catch {
    // Express API down or error
  }

  // 2. Direct MongoDB update
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

    revalidatePath("/dashboard/admin/all-equipment")
    revalidatePath("/dashboard/owner/my-equipment")
    revalidatePath("/browse-equipments")

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
