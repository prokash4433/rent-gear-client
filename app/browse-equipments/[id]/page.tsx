import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { requireSession } from "@/lib/auth-guard"
import { getServerAccessToken } from "@/lib/server-token"
import { getEquipmentById } from "@/lib/api/equipments"
import { BookingCard } from "./booking-card"
import { EquipmentInfo } from "./equipment-info"

/**
 * Private, per-user page: rendered per request so the session check and
 * the API JWT always come from the incoming request.
 */
export const dynamic = "force-dynamic"

/**
 * Equipment details — a private page. Anyone who is not signed in
 * is sent to the sign-in page before the equipment is even fetched.
 */
const EquipmentDetailsPage = async ({
          params,
          searchParams,
}: {
          params: Promise<{ id: string }>
          searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
          const session = await requireSession()

          const { id } = await params
          const query = await searchParams

          // Server-side call to the Express API — send this request's JWT.
          const token = await getServerAccessToken()
          const equipment = await getEquipmentById(id, token)
          if (!equipment) notFound()

          // The public page only shows approved listings
          // (documents without a status field count as approved).
          if (equipment.status && equipment.status !== "approved") notFound()

          const cancelled = query.cancelled === "1"

          return (
                    <div>
                              {/* ---------- Back navigation bar ---------- */}
                              <div className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-6">
                                        <div className="mx-auto max-w-7xl">
                                                  <Link
                                                            href="/browse-equipments"
                                                            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                                  >
                                                            <ArrowLeft className="size-3.5" />
                                                            Back to All Equipments
                                                  </Link>
                                        </div>
                              </div>

                              {/* ---------- Hero ---------- */}
                              <section className="bg-brand">
                                        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
                                                  <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                                                            Equipment Details
                                                  </h1>
                                                  <p className="mt-1 text-sm text-neutral-800">
                                                            Review the listing, then book your rental
                                                            dates — payment happens on Stripe&apos;s secure
                                                            page.
                                                  </p>
                                        </div>
                              </section>

                              {/* ---------- Info + booking ---------- */}
                              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-3">
                                        <div className="min-w-0 lg:col-span-2">
                                                  <EquipmentInfo
                                                            equipment={equipment}
                                                            userEmail={session.user.email}
                                                  />
                                        </div>

                                        <div className="lg:sticky lg:top-24 lg:self-start">
                                                  <BookingCard
                                                            equipment={equipment}
                                                            cancelled={cancelled}
                                                            userEmail={session.user.email}
                                                  />
                                        </div>
                              </div>
                    </div>
          )
}

export default EquipmentDetailsPage
