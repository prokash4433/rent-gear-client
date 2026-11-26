import { NextResponse } from "next/server"
import { requireApiAdmin } from "@/lib/auth-guard"
import { getAllRentals, updateRentalStatus, deleteRental } from "@/lib/actions/rentals"
import type { RentalStatus } from "@/lib/types"

/**
 * GET /api/admin/rentals
 * Returns all platform booking records.
 */
export async function GET() {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const rentals = await getAllRentals()
    return NextResponse.json({ rentals })
  } catch (error) {
    console.error("GET /api/admin/rentals failed:", error)
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/rentals
 * Body: { bookingId: string, status: RentalStatus }
 */
export async function PATCH(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const body = await req.json()
    const { bookingId, status } = body

    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status are required" }, { status: 400 })
    }

    const res = await updateRentalStatus(bookingId, status as RentalStatus)
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Booking marked as ${status}` })
  } catch (error) {
    console.error("PATCH /api/admin/rentals failed:", error)
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/rentals
 * Query or body: ?bookingId=xxx
 */
export async function DELETE(req: Request) {
  const gate = await requireApiAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const { searchParams } = new URL(req.url)
    let bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      const body = await req.json().catch(() => ({}))
      bookingId = body.bookingId
    }

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 })
    }

    const res = await deleteRental(bookingId)
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Booking removed" })
  } catch (error) {
    console.error("DELETE /api/admin/rentals failed:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
