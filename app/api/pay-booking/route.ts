import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

import { stripe } from '@/lib/stripe'

const equipments = db.collection('equipments')
const bookings = db.collection('bookings')

/**
 * Creates a Stripe-hosted Checkout Session for an existing unpaid booking
 * (the "Pay with Stripe" button on My Bookings). The booking itself is only
 * marked paid by the payment success page after Stripe confirms the session.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }
    const userEmail = session.user.email

    const body = await req.json()
    const bookingId = String(body.bookingId ?? '')
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking' }, { status: 400 })
    }

    // Only the owner of the booking can pay for it.
    const booking = await bookings.findOne({
      _id: new ObjectId(bookingId),
      userEmail,
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'This booking is already paid' }, { status: 400 })
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json(
        { error: 'This booking can no longer be paid' },
        { status: 400 }
      )
    }

    const startDate = String(booking.startDate ?? '')
    const endDate = String(booking.endDate ?? '')
    const quantity = Number(booking.quantity) || 1
    const equipmentId = String(booking.equipmentId ?? '')

    // Re-check availability: unpaid bookings do not hold stock, so another
    // customer may have paid for the same dates since this one was created.
    if (ObjectId.isValid(equipmentId)) {
      const equipment = await equipments.findOne({ _id: new ObjectId(equipmentId) })
      if (!equipment) {
        return NextResponse.json({ error: 'Equipment no longer exists' }, { status: 404 })
      }

      const stock = Number(equipment.quantity) || 0
      const overlapping = await bookings
        .find({
          equipmentId,
          paymentStatus: 'paid',
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
          _id: { $ne: new ObjectId(bookingId) },
        })
        .toArray()
      const booked = overlapping.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      )
      if (booked + quantity > stock) {
        return NextResponse.json(
          { error: 'Not enough units free for the selected dates' },
          { status: 400 }
        )
      }
    }

    const totalAmount = Number(booking.totalAmount) || 0
    if (!(totalAmount > 0)) {
      return NextResponse.json({ error: 'Invalid booking amount' }, { status: 400 })
    }

    const equipmentName = String(booking.equipmentName ?? 'Equipment Rental')
    const rentalType = String(booking.rentalType ?? 'Daily')

    // No customer_email so Stripe does not lock/verify the email field —
    // the card input (Visa) is shown immediately at the top.
    const origin = new URL(req.url).origin
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'bdt',
            // BDT is a two-decimal currency: 33 taka = 3300 minor units.
            unit_amount: totalAmount * 100,
            product_data: {
              name: equipmentName,
              description: `${quantity} x ${rentalType} rental, ${startDate} to ${endDate}`,
            },
          },
        },
      ],
      metadata: {
        bookingId,
        equipmentId,
        userEmail,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/my-booking?cancelled=1`,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('POST /api/pay-booking failed:', error)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
