import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, Home, Package } from "lucide-react"
import { ObjectId } from "mongodb"

import { Button } from "@/components/ui/button"
import {
          Card,
          CardContent,
          CardDescription,
          CardHeader,
          CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

const bookings = db.collection('bookings')
const payments = db.collection('payments')

type Result =
          | { ok: true; amount: string; sessionId: string }
          | { ok: false; title: string; description: string }

/**
 * Stripe redirects here after a successful payment
 * (success_url carries session_id={CHECKOUT_SESSION_ID}).
 * The session is re-checked with Stripe before anything is saved,
 * so a fake query string can never mark a booking as paid.
 */
async function verifyPayment(sessionId: string, userEmail: string): Promise<Result> {
          try {
                    // Look up the real session on Stripe.
                    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

                    // Only a paid session belonging to the logged-in customer counts.
                    if (stripeSession.payment_status !== "paid") {
                              return {
                                        ok: false,
                                        title: "Payment not completed",
                                        description: "This checkout session has not been paid.",
                              }
                    }
                    if (stripeSession.metadata?.userEmail !== userEmail) {
                              return {
                                        ok: false,
                                        title: "Not your payment",
                                        description: "This receipt belongs to another account.",
                              }
                    }

                    const bookingId = stripeSession.metadata?.bookingId ?? ""
                    const paymentIntentId =
                              typeof stripeSession.payment_intent === "string"
                                        ? stripeSession.payment_intent
                                        : (stripeSession.payment_intent?.id ?? "")

                    // Idempotent: re-visiting the page must not duplicate anything.
                    if (bookingId && ObjectId.isValid(bookingId)) {
                              await bookings.updateOne(
                                        { _id: new ObjectId(bookingId) },
                                        {
                                                  $set: {
                                                            status: 'confirmed',
                                                            paymentStatus: 'paid',
                                                            stripeSessionId: sessionId,
                                                            paymentIntentId,
                                                            paidAt: new Date(),
                                                  },
                                        }
                              )
                    }

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

                    return {
                              ok: true,
                              amount: ((stripeSession.amount_total ?? 0) / 100).toLocaleString("en-US"),
                              sessionId,
                    }
          } catch (error) {
                    console.error('Payment success page failed:', error)
                    return {
                              ok: false,
                              title: "Could not verify payment",
                              description:
                                        "Something went wrong while checking your payment. Please contact support if you were charged.",
                    }
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
          const sessionId = typeof params.session_id === "string" ? params.session_id : ""

          if (!sessionId) {
                    return (
                              <FailureMessage
                                        title="Missing payment reference"
                                        description="No session id was passed to this page."
                              />
                    )
          }

          const result = await verifyPayment(sessionId, session.user.email)

          if (!result.ok) {
                    return <FailureMessage title={result.title} description={result.description} />
          }

          return (
                    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 p-6 text-center">
                              <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                                        <CheckCircle2 className="size-9 text-emerald-600 dark:text-emerald-400" />
                              </span>

                              <Card className="w-full rounded-2xl">
                                        <CardHeader>
                                                  <CardTitle className="text-xl">
                                                            Payment Successful!
                                                  </CardTitle>
                                                  <CardDescription>
                                                            Your rental booking is confirmed and
                                                            saved to your account.
                                                  </CardDescription>
                                        </CardHeader>

                                        <CardContent className="flex flex-col gap-2 text-sm">
                                                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                                            <span className="text-muted-foreground">Amount paid</span>
                                                            <span className="font-semibold text-brand-hover">
                                                                      ৳{result.amount}
                                                            </span>
                                                  </div>
                                                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                                            <span className="text-muted-foreground">Reference</span>
                                                            <span className="truncate font-mono text-xs">{result.sessionId}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                                            <span className="text-muted-foreground">Status</span>
                                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                                      Paid
                                                            </span>
                                                  </div>

                                                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                                            <Button
                                                                      render={<Link href="/browse-equipments" />}
                                                                      className="flex-1 cursor-pointer bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                            >
                                                                      <Package className="size-4" />
                                                                      Browse More Equipment
                                                            </Button>
                                                            <Button
                                                                      variant="outline"
                                                                      render={<Link href="/dashboard/customer" />}
                                                                      className="flex-1 cursor-pointer"
                                                            >
                                                                      <Home className="size-4" />
                                                                      My Bookings
                                                            </Button>
                                                  </div>
                                        </CardContent>
                              </Card>
                    </div>
          )
}

/** Shown when the page is opened without a valid paid session. */
function FailureMessage({ title, description }: { title: string; description: string }) {
          return (
                    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 p-6 text-center">
                              <Card className="w-full rounded-2xl">
                                        <CardHeader>
                                                  <CardTitle>{title}</CardTitle>
                                                  <CardDescription>{description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                  <Button
                                                            render={<Link href="/browse-equipments" />}
                                                            className="cursor-pointer bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                  >
                                                            Back to Browse
                                                  </Button>
                                        </CardContent>
                              </Card>
                    </div>
          )
}

export default PaymentSuccessPage
