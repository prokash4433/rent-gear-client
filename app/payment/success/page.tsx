import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ObjectId } from "mongodb"
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Mail,
  Package,
  Receipt,
  type LucideIcon,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { buttonVariants } from "@/components/ui/button"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { cn } from "@/lib/utils"

const bookings = db.collection("bookings")
const payments = db.collection("payments")

/** Everything the success page shows, gathered during verification. */
type PaymentDetails = {
  amount: number // taka (Stripe's minor units ÷ 100)
  currency: string // "BDT"
  equipmentName: string
  startDate: string
  endDate: string
  quantity: number
  rentalType: string
  bookingId: string
  paymentRef: string // payment intent (or checkout session) id
  paidAt: Date
  userEmail: string
}

/**
 * Verifies the Stripe session, marks the booking as paid and records the
 * payment (both idempotent — a refresh of this page changes nothing).
 *
 * Returns the details to display, or null when the payment didn't go
 * through or belongs to another user.
 */
async function verifyPayment(
  sessionId: string,
  userEmail: string
): Promise<PaymentDetails | null> {
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    })

    if (
      stripeSession.payment_status !== "paid" ||
      stripeSession.metadata?.userEmail !== userEmail
    ) {
      return null
    }

    const bookingId = stripeSession.metadata?.bookingId ?? ""
    const paymentIntentId =
      typeof stripeSession.payment_intent === "string"
        ? stripeSession.payment_intent
        : (stripeSession.payment_intent?.id ?? "")

    // Mark the booking as paid (idempotent).
    if (bookingId && ObjectId.isValid(bookingId)) {
      const result = await bookings.updateOne(
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
      if (result.matchedCount === 0) {
        console.error(`Payment verified but booking ${bookingId} was not found`)
      }
    }

    // Record the payment (idempotent). amount is stored in taka — the same
    // unit as bookings.totalAmount — while Stripe reports amount_total in
    // the currency's minor unit (paisa).
    await payments.updateOne(
      { stripeSessionId: sessionId },
      {
        $setOnInsert: {
          stripeSessionId: sessionId,
          paymentIntentId,
          bookingId,
          equipmentId: stripeSession.metadata?.equipmentId ?? "",
          userEmail,
          amount: Math.round((stripeSession.amount_total ?? 0) / 100),
          currency: stripeSession.currency ?? "bdt",
          status: "paid",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Prefer the booking document (it has the rental details); fall back
    // to the Stripe line item when the booking is gone.
    const booking =
      bookingId && ObjectId.isValid(bookingId)
        ? await bookings.findOne({ _id: new ObjectId(bookingId) })
        : null
    const lineItem = stripeSession.line_items?.data?.[0]
    // Inline `price_data` prices carry the product name in `product_data`;
    // stripe's `Price` type doesn't model that field, hence the cast.
    const stripeLineItemName = (
      lineItem?.price as
        | { product_data?: { name?: string } }
        | null
        | undefined
    )?.product_data?.name
    const paidAt = booking?.paidAt ? new Date(booking.paidAt) : new Date()

    return {
      amount: Math.round((stripeSession.amount_total ?? 0) / 100),
      currency: (stripeSession.currency ?? "bdt").toUpperCase(),
      equipmentName:
        (booking?.equipmentName as string | undefined) ||
        stripeLineItemName ||
        "Equipment booking",
      startDate: (booking?.startDate as string | undefined) ?? "",
      endDate: (booking?.endDate as string | undefined) ?? "",
      quantity: (booking?.quantity as number | undefined) ?? 1,
      rentalType: (booking?.rentalType as string | undefined) ?? "",
      bookingId,
      paymentRef: paymentIntentId || sessionId,
      paidAt,
      userEmail,
    }
  } catch (error) {
    console.error("Payment verification failed:", error)
    return null
  }
}

/** One label + value row in the receipt list. */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-hover" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={cn(
            "mt-0.5 break-words text-sm font-medium",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Payment Successful | Rent Gear",
  description: "Your payment was received and your booking is confirmed.",
}

/**
 * Stripe redirects here after a successful payment
 * (success_url carries session_id={CHECKOUT_SESSION_ID}).
 *
 * The payment is verified and persisted, then the receipt is rendered
 * with a button through to My Bookings. Failed/foreign payments are sent
 * back to My Bookings with the failure indicator instead.
 */
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

  const details = await verifyPayment(sessionId, session.user.email)

  // `redirect()` throws Next's control-flow error — it must stay outside
  // any try/catch around verification.
  if (!details) redirect("/dashboard/customer/my-booking?payment=failed")

  const paidAtLabel = details.paidAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const rentalPeriod =
    details.startDate && details.endDate
      ? `${details.startDate} → ${details.endDate} · ${details.quantity} × ${details.rentalType || "Daily"}`
      : `${details.quantity} × ${details.rentalType || "Daily"}`

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="bg-brand">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            Payment
          </h1>
          <p className="mt-1 text-sm text-neutral-800">
            Your payment was processed securely by Stripe.
          </p>
        </div>
      </section>

      {/* ---------- Receipt ---------- */}
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <BadgeCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">Payment Successful!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thanks — your booking is confirmed. The receipt below was
              recorded for {details.userEmail}.
            </p>
          </div>

          <dl className="mt-6 divide-y overflow-hidden rounded-xl border">
            <DetailRow
              icon={Receipt}
              label="Amount paid"
              value={`৳${details.amount.toLocaleString("en-US")} ${details.currency}`}
            />
            <DetailRow icon={Package} label="Equipment" value={details.equipmentName} />
            <DetailRow icon={CalendarDays} label="Rental period" value={rentalPeriod} />
            <DetailRow icon={CreditCard} label="Payment reference" value={details.paymentRef} mono />
            <DetailRow icon={Mail} label="Receipt email" value={details.userEmail} />
            <DetailRow icon={BadgeCheck} label="Paid on" value={paidAtLabel} />
            {details.bookingId ? (
              <DetailRow icon={Receipt} label="Booking ID" value={details.bookingId} mono />
            ) : null}
          </dl>

          {/* ---------- Actions ---------- */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/customer/my-booking?payment=success"
              className={cn(
                buttonVariants(),
                "h-10 bg-brand px-6 text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
              )}
            >
              Go to My Bookings
            </Link>
            <Link
              href="/browse-equipments"
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-6")}
            >
              Browse More Equipment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
