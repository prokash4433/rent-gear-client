"use client"

import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { EquipmentListItem } from "@/lib/types"
import { deleteEquipment } from "@/lib/actions/equipments"
import { useState } from "react"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

export function DeleteEquipmentDialog({
  equipment,
  trigger,
}: {
  equipment: EquipmentListItem
  /** Custom element that opens the confirm dialog (defaults to a Delete button). */
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const res = await deleteEquipment(equipment.id)

      if (!res.deletedCount) {
        toast.add({
          type: "error",
          title: "Could not delete listing",
          description:
            "error" in res && res.error
              ? res.error
              : `${equipment.name} was not found. Refresh the page and try again.`,
        })
        return
      }

      setOpen(false)

      toast.add({
        type: "success",
        title: "Listing deleted",
        description: `${equipment.name} was removed from your equipment list.`,
      })

      // Server theke notun data ane, jate deleted row table theke soriye jay
      router.refresh()
    } catch (error) {
      console.error("delete failed", error)
      toast.add({
        type: "error",
        title: "Could not delete listing",
        description: `Something went wrong while deleting ${equipment.name}. Please try again.`,
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button variant="destructive" size="sm">
              <Trash2Icon />
            </Button>
          )
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete listing?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {equipment.name} from your equipment
            list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}