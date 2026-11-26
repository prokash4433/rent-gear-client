import { NextResponse } from "next/server"
import { requireApiAdmin } from "@/lib/auth-guard"
import { getAllAdminEquipments, updateEquipmentStatus, updateEquipment, deleteEquipment } from "@/lib/actions/equipments"
import type { EquipmentStatus } from "@/lib/types"

/**
 * GET /api/admin/equipments
 * Returns all equipment listings including pending, approved, and rejected.
 */
export async function GET() {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const equipments = await getAllAdminEquipments()
    return NextResponse.json({ equipments })
  } catch (error) {
    console.error("GET /api/admin/equipments failed:", error)
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/equipments
 * Body: { equipmentId: string, status?: EquipmentStatus, rentalPrice?: string, quantity?: string, ... }
 */
export async function PATCH(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const body = await req.json()
    const { equipmentId, status, rentalPrice, quantity } = body

    if (!equipmentId) {
      return NextResponse.json({ error: "equipmentId is required" }, { status: 400 })
    }

    if (status) {
      const res = await updateEquipmentStatus(equipmentId, status as EquipmentStatus)
      return NextResponse.json(res)
    }

    if (rentalPrice !== undefined || quantity !== undefined) {
      const res = await updateEquipment(equipmentId, {
        rentalPrice: String(rentalPrice ?? ""),
        quantity: String(quantity ?? ""),
      })
      return NextResponse.json(res)
    }

    return NextResponse.json({ error: "No update parameters provided" }, { status: 400 })
  } catch (error) {
    console.error("PATCH /api/admin/equipments failed:", error)
    return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/equipments
 * Query or body: ?equipmentId=xxx
 */
export async function DELETE(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const { searchParams } = new URL(req.url)
    let equipmentId = searchParams.get("equipmentId")

    if (!equipmentId) {
      const body = await req.json().catch(() => ({}))
      equipmentId = body.equipmentId
    }

    if (!equipmentId) {
      return NextResponse.json({ error: "equipmentId is required" }, { status: 400 })
    }

    const res = await deleteEquipment(equipmentId)
    return NextResponse.json(res)
  } catch (error) {
    console.error("DELETE /api/admin/equipments failed:", error)
    return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 })
  }
}
