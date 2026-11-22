import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
 
import { stripe } from '@/lib/stripe'
import { rentalPeriods, rentalTotal } from '@/lib/bookings'

const equipments = db.collection('equipments')
const bookings = db.collection('bookings')

const datePattern = /^\d{4}-\d{2}-\d{2}$/

/**
 * Creates a booking (unpaid) and a Stripe-hosted Checkout Session for it.
 * The customer is sent to Stripe's own page; the payment success page
 * confirms the session and marks the booking as paid.
 */
export async function POST(req: Request) {
  try {
    // Only a signed-in user can book.
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }
    const userEmail = session.user.email

    const body = await req.json()
    const equipmentId = String(body.equipmentId ?? '')
    const startDate = String(body.startDate ?? '')
    const endDate = String(body.endDate ?? '')
    const quantity = Number(body.quantity)
    const contactNumber = String(body.contactNumber ?? '').trim()
    const deliveryAddress = String(body.deliveryAddress ?? '').trim()
    const notes = String(body.notes ?? '').trim()

    // Validate the booking form on the server too.
    if (!ObjectId.isValid(equipmentId)) {
      return NextResponse.json({ error: 'Invalid equipment' }, { status: 400 })
    }
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return NextResponse.json({ error: 'Please pick valid dates' }, { status: 400 })
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date must be on or after the start date' },
        { status: 400 }
      )
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }
    if (!contactNumber || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Contact number and delivery address are required' },
        { status: 400 }
      )
    }

    const equipment = await equipments.findOne({ _id: new ObjectId(equipmentId) })
    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }
    // Older documents have no status -> treated as approved.
    if (equipment.status && equipment.status !== 'approved') {
      return NextResponse.json({ error: 'This equipment is not available' }, { status: 400 })
    }

    const stock = Number(equipment.quantity) || 0
    if (quantity > stock) {
      return NextResponse.json(
        { error: `Only ${stock} unit(s) available` },
        { status: 400 }
      )
    }

    // Availability: units already booked (and paid) for overlapping dates.
    const overlapping = await bookings
      .find({
        equipmentId,
        paymentStatus: 'paid',
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      })
      .toArray()
    const booked = overlapping.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    if (booked + quantity > stock) {
      return NextResponse.json(
        { error: 'Not enough units free for the selected dates' },
        { status: 400 }
      )
    }

    // Total is calculated here (server side) so the client can never send its own price.
    const price = Number(equipment.rentalPrice) || 0
    const rentalType = String(equipment.rentalType || 'Daily')
    const periods = rentalPeriods(startDate, endDate, rentalType)
    const totalAmount = rentalTotal(price, startDate, endDate, rentalType, quantity)

    const booking = await bookings.insertOne({
      equipmentId,
      equipmentName: equipment.name,
      ownerEmail: equipment.ownerEmail ?? '',
      userEmail,
      startDate,
      endDate,
      quantity,
      rentalType,
      periods,
      pricePerPeriod: price,
      totalAmount,
      currency: 'bdt',
      contactNumber,
      deliveryAddress,
      notes,
      status: 'unpaid',
      paymentStatus: 'unpaid',
      createdAt: new Date(),
    })

    // Stripe-hosted checkout page (docs: Build a payments page).
    const origin = new URL(req.url).origin
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'bdt',
            // BDT is a two-decimal currency: 33 taka = 3300 minor units.
            unit_amount: totalAmount * 100,
            product_data: {
              name: equipment.name,
              description: `${quantity} x ${rentalType} rental, ${startDate} to ${endDate}`,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.insertedId.toString(),
        equipmentId,
        userEmail,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/browse-equipments/${equipmentId}?cancelled=1`,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('POST /api/checkout_sessions failed:', error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
