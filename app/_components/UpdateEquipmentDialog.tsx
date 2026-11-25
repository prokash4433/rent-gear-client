"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
          Dialog,
          DialogClose,
          DialogContent,
          DialogDescription,
          DialogFooter,
          DialogHeader,
          DialogTitle,
          DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updateEquipment } from "@/lib/actions/equipments"
import type { EquipmentListItem } from "@/lib/types"

const UpdateEquipmentDialog = ({
          equipment,
          trigger,
}: {
          equipment: EquipmentListItem
          /** Custom element that opens the dialog (defaults to an Update button). */
          trigger?: React.ReactElement
}) => {
          const router = useRouter()
          const [open, setOpen] = useState(false)
          const [loading, setLoading] = useState(false)

          const handleUpdateEquipment = async (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault()

                    const formData = new FormData(e.currentTarget)
                    const rentalPrice = String(formData.get("rentalPrice") ?? "").trim()
                    const quantity = String(formData.get("quantity") ?? "").trim()

                    // Validation
                    if (rentalPrice === "" || Number.isNaN(Number(rentalPrice)) || Number(rentalPrice) < 0) {
                              toast.add({
                                        type: "error",
                                        title: "Invalid rental price",
                                        description: "Enter a valid rental price.",
                              })
                              return
                    }

                    if (quantity === "" || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
                              toast.add({
                                        type: "error",
                                        title: "Invalid quantity",
                                        description: "Enter a whole number of units.",
                              })
                              return
                    }

                    try {
                              setLoading(true)
                              await updateEquipment(equipment.id, { rentalPrice, quantity })

                              setOpen(false)

                              toast.add({
                                        type: "success",
                                        title: "Listing updated",
                                        description: `Price and stock saved for ${equipment.name}.`,
                              })

                              // Server theke notun data ane, jate table e updated value dekhay
                              router.refresh()
                    } catch (error) {
                              console.error("update failed", error)
                              toast.add({
                                        type: "error",
                                        title: "Update failed",
                                        description: `Could not update ${equipment.name}. Please try again.`,
                              })
                    } finally {
                              setLoading(false)
                    }
          }

          return (
                    <Dialog open={open} onOpenChange={setOpen}>
                              <DialogTrigger
                                        render={
                                                  trigger ?? (
                                                            <Button variant="outline" size="sm">
                                                                      Update
                                                            </Button>
                                                  )
                                        }
                              />
                              <DialogContent className="sm:max-w-sm">
                                        <form onSubmit={handleUpdateEquipment} className="flex flex-col gap-4">
                                                  <DialogHeader>
                                                            <DialogTitle>Update listing</DialogTitle>
                                                            <DialogDescription>
                                                                      Change the rental price or the available stock for {equipment.name}.
                                                            </DialogDescription>
                                                  </DialogHeader>
                                                  <FieldGroup>
                                                            <Field>
                                                                      <Label htmlFor={`rentalPrice-${equipment.id}`}>Rental Price (৳)</Label>
                                                                      <Input
                                                                                id={`rentalPrice-${equipment.id}`}
                                                                                name="rentalPrice"
                                                                                inputMode="decimal"
                                                                                defaultValue={equipment.rentalPrice}
                                                                      />
                                                            </Field>
                                                            <Field>
                                                                      <Label htmlFor={`quantity-${equipment.id}`}>Available Quantity</Label>
                                                                      <Input
                                                                                id={`quantity-${equipment.id}`}
                                                                                name="quantity"
                                                                                inputMode="numeric"
                                                                                defaultValue={equipment.quantity}
                                                                      />
                                                            </Field>
                                                  </FieldGroup>
                                                  <DialogFooter>
                                                            <DialogClose render={<Button variant="outline" type="button">Cancel</Button>} />
                                                            <Button type="submit" disabled={loading}>
                                                                      {loading ? "Saving..." : "Save changes"}
                                                            </Button>
                                                  </DialogFooter>
                                        </form>
                              </DialogContent>
                    </Dialog>
          )
}

export default UpdateEquipmentDialog