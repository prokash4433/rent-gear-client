"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { CalendarRange, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
          Card,
          CardContent,
          CardDescription,
          CardHeader,
          CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
 
import type { EquipmentDocument } from "@/lib/types"
import { rentalDays, rentalPeriods, rentalTotal } from "@/lib/bookings"

type BookingCardProps = {
          equipment: EquipmentDocument
          /** True when Stripe checkout was cancelled (?cancelled=1). */
          cancelled: boolean
          /** The signed-in user's email — shown in Contact Information. */
          userEmail: string
}

/** Form state: every value is a string, exactly like the inputs hold it. */
type BookingValues = {
          startDate: string
          endDate: string
          quantity: string
          contactNumber: string
          deliveryAddress: string
          notes: string
}

const initialValues: BookingValues = {
          startDate: "",
          endDate: "",
          quantity: "1",
          contactNumber: "",
          deliveryAddress: "",
          notes: "",
}

export function BookingCard({ equipment, cancelled, userEmail }: BookingCardProps) {
          const [values, setValues] = useState<BookingValues>(initialValues)
          const [submitting, setSubmitting] = useState(false)
          // Blocks a second click while the first request is on its way.
          const submittingRef = useRef(false)

          const price = Number(equipment.rentalPrice) || 0
          const rentalType = String(equipment.rentalType || "Daily")
          const stock = Number(equipment.quantity) || 0

          const { startDate, endDate } = values
          const quantity = Number(values.quantity) || 0
          const days = rentalDays(startDate, endDate)
          const periods = rentalPeriods(startDate, endDate, rentalType)
          const total = rentalTotal(price, startDate, endDate, rentalType, quantity)

          // Warn once when the customer comes back from Stripe without paying.
          useEffect(() => {
                    if (cancelled) {
                              toast.add({
                                        type: "info",
                                        title: "Checkout cancelled",
                                        description:
                                                  "No payment was taken. You can try booking again.",
                              })
                    }
          }, [cancelled])

          // Total is always visible once dates + quantity are filled.
          const showTotal = useMemo(
                    () => days > 0 && quantity > 0 && total > 0,
                    [days, quantity, total]
          )

          function setField(field: keyof BookingValues, value: string) {
                    setValues((current) => ({ ...current, [field]: value }))
          }

          async function handleSubmit(event: FormEvent<HTMLFormElement>) {
                    event.preventDefault()
                    if (submittingRef.current) return

                    // Basic checks before talking to the API
                    // (the API route validates everything again).
                    if (!startDate || !endDate) {
                              toast.add({
                                        type: "error",
                                        title: "Dates required",
                                        description: "Please pick both rental dates.",
                              })
                              return
                    }
                    if (endDate < startDate) {
                              toast.add({
                                        type: "error",
                                        title: "Check the dates",
                                        description: "End date must be on or after the start date.",
                              })
                              return
                    }
                    if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock) {
                              toast.add({
                                        type: "error",
                                        title: "Check the quantity",
                                        description: `Choose between 1 and ${stock} unit(s).`,
                              })
                              return
                    }
                    if (!values.contactNumber.trim() || !values.deliveryAddress.trim()) {
                              toast.add({
                                        type: "error",
                                        title: "Contact details required",
                                        description: "Contact number and delivery address are needed.",
                              })
                              return
                    }

                    submittingRef.current = true
                    setSubmitting(true)
                    try {
                              const res = await fetch("/api/checkout_sessions", {
                                        method: "POST",
                                        headers: { "content-type": "application/json" },
                                        body: JSON.stringify({
                                                  equipmentId: String(equipment._id),
                                                  ...values,
                                                  quantity,
                                        }),
                              })
                              const data = await res.json()
                              if (!res.ok) {
                                        throw new Error(data.error || "Could not start checkout")
                              }

                              // Stripe hosts the payment page; send the customer there.
                              window.location.assign(data.url as string)
                    } catch (error) {
                              toast.add({
                                        type: "error",
                                        title: "Could not start checkout",
                                        description:
                                                  error instanceof Error
                                                            ? error.message
                                                            : "Something went wrong. Please try again.",
                              })
                              submittingRef.current = false
                              setSubmitting(false)
                    }
          }

          return (
                    <Card className="rounded-2xl">
                              <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                                                            <CalendarRange className="size-4 text-brand-hover" />
                                                  </span>
                                                  Book This Equipment
                                        </CardTitle>
                                        <CardDescription>
                                                  Pick your rental dates and quantity — the total is
                                                  calculated for you, then you pay securely on Stripe.
                                        </CardDescription>
                              </CardHeader>

                              <CardContent>
                                        <form
                                                  onSubmit={handleSubmit}
                                                  noValidate
                                                  className="flex flex-col gap-4"
                                        >
                                                  {/* ---------- Dates + quantity ---------- */}
                                                  <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex flex-col gap-1.5">
                                                                      <Label htmlFor="booking-start">
                                                                                Start Date <span className="text-destructive">*</span>
                                                                      </Label>
                                                                      <Input
                                                                                id="booking-start"
                                                                                type="date"
                                                                                value={startDate}
                                                                                onChange={(event) =>
                                                                                          setField(
                                                                                                    "startDate",
                                                                                                    event.target.value
                                                                                          )
                                                                                }
                                                                      />
                                                            </div>

                                                            <div className="flex flex-col gap-1.5">
                                                                      <Label htmlFor="booking-end">
                                                                                End Date <span className="text-destructive">*</span>
                                                                      </Label>
                                                                      <Input
                                                                                id="booking-end"
                                                                                type="date"
                                                                                min={startDate || undefined}
                                                                                value={endDate}
                                                                                onChange={(event) =>
                                                                                          setField(
                                                                                                    "endDate",
                                                                                                    event.target.value
                                                                                          )
                                                                                }
                                                                      />
                                                            </div>
                                                  </div>

                                                  <div className="flex flex-col gap-1.5">
                                                            <Label htmlFor="booking-quantity">
                                                                      Required Quantity <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Input
                                                                      id="booking-quantity"
                                                                      type="number"
                                                                      min="1"
                                                                      max={stock}
                                                                      value={values.quantity}
                                                                      onChange={(event) =>
                                                                                setField(
                                                                                          "quantity",
                                                                                          event.target.value
                                                                                )
                                                                      }
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                      {stock} unit(s) available
                                                            </p>
                                                  </div>

                                                  {/* ---------- Contact Information ---------- */}
                                                  <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3">
                                                            <p className="flex items-center gap-1.5 text-sm font-semibold">
                                                                      <Mail className="size-4 text-brand-hover" />
                                                                      Contact Information
                                                            </p>

                                                            {/* Signed-in user's email, shown automatically. */}
                                                            <div className="flex flex-col gap-1.5">
                                                                      <Label htmlFor="booking-email">
                                                                                Email
                                                                      </Label>
                                                                      <Input
                                                                                id="booking-email"
                                                                                type="email"
                                                                                value={userEmail}
                                                                                readOnly
                                                                                aria-readonly
                                                                                className="text-muted-foreground"
                                                                      />
                                                                      <p className="text-xs text-muted-foreground">
                                                                                From your account — booking confirmations are sent here.
                                                                      </p>
                                                            </div>

                                                            <div className="flex flex-col gap-1.5">
                                                                      <Label htmlFor="booking-contact">
                                                                                Contact Number <span className="text-destructive">*</span>
                                                                      </Label>
                                                                      <Input
                                                                                id="booking-contact"
                                                                                type="tel"
                                                                                placeholder="01XXXXXXXXX"
                                                                                value={values.contactNumber}
                                                                                onChange={(event) =>
                                                                                          setField(
                                                                                                    "contactNumber",
                                                                                                    event.target.value
                                                                                          )
                                                                                }
                                                                      />
                                                            </div>

                                                            <div className="flex flex-col gap-1.5">
                                                                      <Label htmlFor="booking-address">
                                                                                Delivery Address <span className="text-destructive">*</span>
                                                                      </Label>
                                                                      <Textarea
                                                                                id="booking-address"
                                                                                rows={2}
                                                                                placeholder="House, road, area, city"
                                                                                value={values.deliveryAddress}
                                                                                onChange={(event) =>
                                                                                          setField(
                                                                                                    "deliveryAddress",
                                                                                                    event.target.value
                                                                                          )
                                                                                }
                                                                      />
                                                            </div>
                                                  </div>

                                                  <div className="flex flex-col gap-1.5">
                                                            <Label htmlFor="booking-notes">
                                                                      Additional Notes
                                                            </Label>
                                                            <Textarea
                                                                      id="booking-notes"
                                                                      rows={2}
                                                                      placeholder="Anything the owner should know (optional)"
                                                                      value={values.notes}
                                                                      onChange={(event) =>
                                                                                setField(
                                                                                          "notes",
                                                                                          event.target.value
                                                                                )
                                                                      }
                                                            />
                                                  </div>

                                                  {/* ---------- Total ---------- */}
                                                  <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/40 p-3">
                                                            <div className="flex items-center justify-between text-sm">
                                                                      <span className="text-muted-foreground">
                                                                                Rate
                                                                      </span>
                                                                      <span>
                                                                                ৳
                                                                                {price.toLocaleString(
                                                                                          "en-US"
                                                                                )}{" "}
                                                                                / {rentalType}
                                                                      </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                      <span className="text-muted-foreground">
                                                                                Duration
                                                                      </span>
                                                                      <span>
                                                                                {showTotal
                                                                                          ? `${days} day(s) · ${periods} × ${rentalType}`
                                                                                          : "—"}
                                                                      </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                      <span className="text-muted-foreground">
                                                                                Quantity
                                                                      </span>
                                                                      <span>{quantity || "—"}</span>
                                                            </div>
                                                            <div className="mt-1 flex items-center justify-between border-t pt-2 text-base font-semibold">
                                                                      <span>Total</span>
                                                                      <span className="text-brand-hover">
                                                                                ৳{total.toLocaleString(
                                                                                          "en-US"
                                                                                )}
                                                                      </span>
                                                            </div>
                                                  </div>

                                                  {/* ---------- Submit ---------- */}
                                                  <Button
                                                            type="submit"
                                                            disabled={submitting || stock < 1}
                                                            className="w-full cursor-pointer bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                  >
                                                            {submitting ? (
                                                                      <>
                                                                                <Loader2 className="size-4 animate-spin" />
                                                                                Redirecting to Stripe…
                                                                      </>
                                                            ) : (
                                                                      "Confirm & Proceed to Payment"
                                                            )}
                                                  </Button>

                                                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                                            <ShieldCheck className="size-3.5" />
                                                            Payments are processed securely by Stripe
                                                  </p>
                                        </form>
                              </CardContent>
                    </Card>
          )
}
