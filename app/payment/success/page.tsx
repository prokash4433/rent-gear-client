import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

const bookings = db.collection("bookings")
const payments = db.collection("payments")

/**
 * Stripe redirects here after a successful payment
 * (success_url carries session_id={CHECKOUT_SESSION_ID}).
 *
 * Instead of showing a separate verification page, the payment is verified
 * silently and the user is redirected to My Bookings with a success indicator
 * in the URL. The booking list page shows a success toast.
 */
async function verifyAndRedirect(sessionId: string, userEmail: string) {
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (
      stripeSession.payment_status !== "paid" ||
      stripeSession.metadata?.userEmail !== userEmail
    ) {
      // Payment didn't go through or belongs to someone else — go to bookings
      return redirect("/dashboard/customer/my-booking?payment=failed")
    }

    const bookingId = stripeSession.metadata?.bookingId ?? ""
    const paymentIntentId =
      typeof stripeSession.payment_intent === "string"
        ? stripeSession.payment_intent
        : (stripeSession.payment_intent?.id ?? "")

    // Mark the booking as paid (idempotent)
    if (bookingId && ObjectId.isValid(bookingId)) {
      await bookings.updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            status: "confirmed",
            paymentStatus: "paid",
            stripeSessionId: sessionId,
            paymentIntentId,
            paidAt: new Date(),
          },
        }
      )
    }

    // Record the payment (idempotent)
    await payments.updateOne(
      { stripeSessionId: sessionId },
      {
        $setOnInsert: {
          stripeSessionId: sessionId,
          paymentIntentId,
          bookingId,
          equipmentId: stripeSession.metadata?.equipmentId ?? "",
          userEmail,
          amount: stripeSession.amount_total ?? 0,
          currency: stripeSession.currency ?? "bdt",
          status: "paid",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return redirect("/dashboard/customer/my-booking?payment=success")
  } catch (error) {
    console.error("Payment verification failed:", error)
    return redirect("/dashboard/customer/my-booking?payment=failed")
  }
}

const PaymentSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const params = await searchParams
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : ""

  if (!sessionId) {
    redirect("/dashboard/customer/my-booking")
  }

  await verifyAndRedirect(sessionId, session.user.email)
}

export default PaymentSuccessPage
