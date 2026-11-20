"use client"

import { useRef, useState } from "react"
import type { DragEvent, FormEvent, ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ImagePlus, Truck, Upload, X } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import type {
  CategoryOption,
  EquipmentFormValues,
  FormErrors,
} from "@/lib/types"
import { validateEquipment } from "@/lib/validation"

// Same categories as the search bar on the home page.
const categories: CategoryOption[] = [
  { value: "agriculture", label: "Agriculture Equipment" },
  { value: "cleaning", label: "Cleaning Equipment" },
  { value: "construction", label: "Construction Equipment" },
  { value: "electronics", label: "Electronics" },
  { value: "events", label: "Event Equipment" },
  { value: "photography", label: "Photography Equipment" },
  { value: "vehicles", label: "Vehicles & Transportation" },
]

const rentalTypes = ["Hourly", "Daily", "Weekly", "Monthly"]
const conditions = ["Excellent", "Good", "Fair"]

/** How many photos one listing may have. */
const maxPhotos = 6

/** The form starts out with the values shown in the reference design. */
const initialValues: EquipmentFormValues = {
  name: "",
  category: "",
  description: "",
  rentalPrice: "100",
  rentalType: "Daily",
  quantity: "1",
  brand: "",
  model: "",
  condition: "Excellent",
  location: "Dhaka, Bangladesh",
  imageUrls: "",
  terms: "",
}

/** One label + control (+ validation message) block, used by every field. */
function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function AddEquipmentPage() {
  const [values, setValues] = useState<EquipmentFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<EquipmentFormValues>>({})
  // The photos picked from the device (kept as File objects).
  const [photos, setPhotos] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update one field and clear its error while the user types.
  function setField(field: keyof EquipmentFormValues, value: string) {
    setValues({ ...values, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  // Keep at most 6 photos, whether they come from the picker or the drop zone.
  function addPhotos(list: FileList | null) {
    if (!list) return
    setPhotos([...photos, ...Array.from(list)].slice(0, maxPhotos))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    addPhotos(event.dataTransfer.files)
  }

  function removePhoto(index: number) {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateEquipment(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      toast.add({
        type: "error",
        title: "Check the form",
        description: "Please fix the highlighted fields and try again.",
      })
      return
    }

    // One object with everything the form collected — this is what would
    // be sent to the backend when the API is ready.
    const equipment = {
      ...values,
      // The textarea holds one URL per line -> turn it into an array.
      imageUrls: values.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      photos: photos.map((photo) => photo.name),
    }
    console.log("Add equipment form data:", equipment)

    toast.add({
      type: "success",
      title: "Equipment published",
      description: "Your listing has been collected (demo — not saved yet).",
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
      {/* Back link */}
      <Link
        href="/dashboard/owner"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to My Equipment
      </Link>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
              <Truck className="size-4 text-brand-hover" />
            </span>
            List New Machinery or Gear
          </CardTitle>
          <CardDescription>
            Provide accurate specs, images, and rental rates to get verified
            and rented faster.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Equipment Name + Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="equipment-name" label="Equipment Name" required error={errors.name}>
                <Input
                  id="equipment-name"
                  value={values.name}
                  placeholder="e.g. Caterpillar Excavator 320D"
                  onChange={(event) => setField("name", event.target.value)}
                />
              </Field>

              <Field id="equipment-category" label="Category" required error={errors.category}>
                <Select
                  items={categories}
                  value={values.category}
                  onValueChange={(value) => setField("category", String(value))}
                >
                  <SelectTrigger id="equipment-category" className="w-full cursor-pointer">
                    <SelectValue  placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                              <SelectItem className="cursor-pointer" key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Description */}
            <Field id="equipment-description" label="Description" required error={errors.description}>
              <Textarea
                id="equipment-description"
                rows={4}
                value={values.description}
                placeholder="Detailed equipment specifications, power, dimensions, operational advice..."
                onChange={(event) => setField("description", event.target.value)}
              />
            </Field>

            {/* Price + Rental Type + Quantity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="equipment-price" label="Rental Price (৳ / $)" required error={errors.rentalPrice}>
                <Input
                  id="equipment-price"
                  type="number"
                  min="1"
                  value={values.rentalPrice}
                  onChange={(event) => setField("rentalPrice", event.target.value)}
                />
              </Field>

              <Field id="equipment-rental-type" label="Rental Type" required error={errors.rentalType}>
                <Select
                  items={rentalTypes.map((type) => ({ value: type, label: type }))}
                  value={values.rentalType}
                  onValueChange={(value) => setField("rentalType", String(value))}
                >
                  <SelectTrigger id="equipment-rental-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rentalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="equipment-quantity" label="Available Quantity" required error={errors.quantity}>
                <Input
                  id="equipment-quantity"
                  type="number"
                  min="1"
                  value={values.quantity}
                  onChange={(event) => setField("quantity", event.target.value)}
                />
              </Field>
            </div>

            {/* Brand + Model + Condition */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="equipment-brand" label="Brand">
                <Input
                  id="equipment-brand"
                  value={values.brand}
                  placeholder="e.g. Caterpillar, Canon"
                  onChange={(event) => setField("brand", event.target.value)}
                />
              </Field>

              <Field id="equipment-model" label="Model">
                <Input
                  id="equipment-model"
                  value={values.model}
                  placeholder="e.g. CAT 320D"
                  onChange={(event) => setField("model", event.target.value)}
                />
              </Field>

              <Field id="equipment-condition" label="Condition">
                <Select
                  items={conditions.map((condition) => ({ value: condition, label: condition }))}
                  value={values.condition}
                  onValueChange={(value) => setField("condition", String(value))}
                >
                  <SelectTrigger id="equipment-condition" className="w-full cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent >
                    {conditions.map((condition) => (
                              <SelectItem className="cursor-pointer" key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Location */}
            <Field id="equipment-location" label="Location (City, Area)" required error={errors.location}>
              <Input
                id="equipment-location"
                value={values.location}
                placeholder="Dhaka, Bangladesh"
                onChange={(event) => setField("location", event.target.value)}
              />
            </Field>

            {/* Images */}
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ImagePlus className="size-4 text-brand-hover" />
                  Equipment &amp; Machinery Images
                </span>
                <span className="text-xs text-muted-foreground">
                  {photos.length}/{maxPhotos} photos
                </span>
              </div>

              {/* Click or drop photos here */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-background px-4 py-8 text-center transition-colors hover:border-brand"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-brand/20">
                  <Upload className="size-5 text-brand-hover" />
                </span>
                <p className="text-sm font-medium">
                  Click to browse or drag and drop images
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload photos directly from your device (JPEG, PNG, WEBP,
                  GIF, max 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => addPhotos(event.target.files)}
              />

              {/* Names of the picked photos, with a remove button each */}
              {photos.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <li
                      key={`${photo.name}-${index}`}
                      className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs"
                    >
                      {photo.name}
                      <button
                        type="button"
                        aria-label={`Remove ${photo.name}`}
                        onClick={() => removePhoto(index)}
                        className="rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="equipment-image-urls" className="text-xs text-muted-foreground">
                  Or add additional image URLs manually (one per line)
                </Label>
                <Textarea
                  id="equipment-image-urls"
                  rows={3}
                  value={values.imageUrls}
                  placeholder="https://..."
                  onChange={(event) => setField("imageUrls", event.target.value)}
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <Field id="equipment-terms" label="Rental Terms & Conditions">
              <Textarea
                id="equipment-terms"
                rows={3}
                value={values.terms}
                placeholder="Operator requirements, fuel policies, deposit instructions..."
                onChange={(event) => setField("terms", event.target.value)}
              />
            </Field>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={<Link href="/dashboard/owner" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover cursor-pointer"
              >
                Publish Equipment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
