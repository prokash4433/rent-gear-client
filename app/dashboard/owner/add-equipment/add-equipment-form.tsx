"use client"

import { useEffect, useRef, useState } from "react"
import type { DragEvent, FormEvent, ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ImagePlus, Truck, Upload, X } from "lucide-react"

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
import { createEquipment } from "@/lib/actions/equipments"
import { uploadToImageBB } from "@/lib/imagebb"
import type {
  CategoryOption,
  EquipmentFormValues,
  EquipmentPayload,
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

/**
 * One photo picked from the device. The file is uploaded to ImgBB as soon as
 * it is added, so the listing can store a real, hostable image URL — the
 * browser never sends the file itself to our own server.
 */
type EquipmentPhoto = {
  id: string
  file: File
  /** Local `blob:` preview shown in the chip while the upload runs. */
  preview: string
  status: "uploading" | "done" | "error"
  /** Public ImgBB URL once the upload finished. */
  url?: string
  /** User-facing reason when the upload failed. */
  error?: string
}

/** Jekhane publish-er por niye jabe. */
const myEquipmentPath = "/dashboard/owner/my-equipment"

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

export default function AddEquipmentForm({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter()
  const [values, setValues] = useState<EquipmentFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<EquipmentFormValues>>({})
  // The photos picked from the device, each already (or being) uploaded to
  // ImgBB — only the resulting public URLs are saved with the listing.
  const [photos, setPhotos] = useState<EquipmentPhoto[]>([])
  // True while the form data is being sent to the API.
  const [saving, setSaving] = useState(false)
  // The ref updates instantly (state only updates after a re-render),
  // so rapid double clicks are blocked too.
  const savingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Live copy of the photos for the unmount cleanup below.
  const photosRef = useRef<EquipmentPhoto[]>([])
  photosRef.current = photos

  // Release the local previews when the form goes away.
  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview))
    },
    []
  )

  const uploadingCount = photos.filter(
    (photo) => photo.status === "uploading"
  ).length

  // Update one field and clear its error while the user types.
  function setField(field: keyof EquipmentFormValues, value: string) {
    setValues({ ...values, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  // Uploads one photo to ImgBB and records the public URL on its entry.
  async function uploadPhoto(entry: EquipmentPhoto) {
    try {
      const url = await uploadToImageBB(entry.file)
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === entry.id ? { ...photo, status: "done", url } : photo
        )
      )
    } catch (error) {
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === entry.id
            ? {
                ...photo,
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Upload failed. Please try again.",
              }
            : photo
        )
      )
    }
  }

  // Keep at most 6 photos, whether they come from the picker or the drop zone.
  // Every new photo starts uploading to ImgBB straight away.
  function addPhotos(list: FileList | null) {
    if (!list) return

    const room = maxPhotos - photos.length
    if (room <= 0) {
      toast.add({
        type: "error",
        title: "Photo limit reached",
        description: `A listing can have up to ${maxPhotos} photos.`,
      })
      return
    }

    const entries: EquipmentPhoto[] = Array.from(list)
      .slice(0, room)
      .map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        status: "uploading" as const,
      }))

    setPhotos((prev) => [...prev, ...entries])
    entries.forEach((entry) => void uploadPhoto(entry))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    addPhotos(event.dataTransfer.files)
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Ignore extra clicks while a save is already on its way —
    // otherwise the same listing gets inserted twice.
    if (savingRef.current) return

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

    // Photos upload in the background while the owner keeps editing —
    // the listing can only be published once every upload has finished.
    if (uploadingCount > 0) {
      toast.add({
        type: "error",
        title: "Photos are still uploading",
        description: "Hang on a moment for the uploads to finish, then publish again.",
      })
      return
    }

    const failedPhoto = photos.find((photo) => photo.status === "error")
    if (failedPhoto) {
      toast.add({
        type: "error",
        title: "Some photos failed to upload",
        description: `Remove "${failedPhoto.file.name}" or add it again, then publish once more.`,
      })
      return
    }

    // One object with everything the form collected.
    const equipment: EquipmentPayload = {
      ...values,
      // The textarea holds one URL per line -> turn it into an array, and
      // append the ImgBB URLs of the picked photos (that is what makes the
      // images show up on My Equipment, the details page and the cards).
      imageUrls: [
        ...values.imageUrls
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        ...photos
          .map((photo) => photo.url)
          .filter((url): url is string => Boolean(url)),
      ],
      photos: photos.map((photo) => photo.file.name),
      // Record who listed it, so My Equipment and the owner queries can
      // filter by owner. Comes from the server session, not client state.
      ownerEmail,
    }

    // Save it through our API action (POST -> MongoDB).
    savingRef.current = true
    setSaving(true)
    try {
      // Send the data and wait for the API's response.
      await createEquipment(equipment)

      toast.add({
        type: "success",
        title: "Equipment published",
        description: `${values.name} was submitted and is pending approval.`,
      })

      // Start fresh so the same listing cannot be published again.
      setValues(initialValues)
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview))
      setPhotos([])

      // Notun data jate sathe sathe dekha jay:
      // 1) router cache refresh, 2) My Equipment page-e niye jaoa.
      router.refresh()
      router.push(myEquipmentPath)
    } catch (error) {
      console.error("Could not save equipment:", error)

      toast.add({
        type: "error",
        title: "Could not save equipment",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      })
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
      {/* Back link */}
      <Link
        href={myEquipmentPath}
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
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Equipment Name + Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="equipment-name"
                label="Equipment Name"
                required
                error={errors.name}
              >
                <Input
                  id="equipment-name"
                  value={values.name}
                  placeholder="e.g. Caterpillar Excavator 320D"
                  onChange={(event) => setField("name", event.target.value)}
                />
              </Field>

              <Field
                id="equipment-category"
                label="Category"
                required
                error={errors.category}
              >
                <Select
                  items={categories}
                  value={values.category}
                  onValueChange={(value) => setField("category", String(value))}
                >
                  <SelectTrigger
                    id="equipment-category"
                    className="w-full cursor-pointer"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Description */}
            <Field
              id="equipment-description"
              label="Description"
              required
              error={errors.description}
            >
              <Textarea
                id="equipment-description"
                rows={4}
                value={values.description}
                placeholder="Detailed equipment specifications, power, dimensions, operational advice..."
                onChange={(event) =>
                  setField("description", event.target.value)
                }
              />
            </Field>

            {/* Price + Rental Type + Quantity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field
                id="equipment-price"
                label="Rental Price (৳ / $)"
                required
                error={errors.rentalPrice}
              >
                <Input
                  id="equipment-price"
                  type="number"
                  min="1"
                  value={values.rentalPrice}
                  onChange={(event) =>
                    setField("rentalPrice", event.target.value)
                  }
                />
              </Field>

              <Field
                id="equipment-rental-type"
                label="Rental Type"
                required
                error={errors.rentalType}
              >
                <Select
                  items={rentalTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  value={values.rentalType}
                  onValueChange={(value) =>
                    setField("rentalType", String(value))
                  }
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

              <Field
                id="equipment-quantity"
                label="Available Quantity"
                required
                error={errors.quantity}
              >
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
                  items={conditions.map((condition) => ({
                    value: condition,
                    label: condition,
                  }))}
                  value={values.condition}
                  onValueChange={(value) =>
                    setField("condition", String(value))
                  }
                >
                  <SelectTrigger
                    id="equipment-condition"
                    className="w-full cursor-pointer"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={condition}
                        value={condition}
                      >
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Location */}
            <Field
              id="equipment-location"
              label="Location (City, Area)"
              required
              error={errors.location}
            >
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

              {/* Thumbnails of the picked photos: live upload status + remove */}
              {photos.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <li
                      key={photo.id}
                      className={`flex items-center gap-2 rounded-lg border bg-background py-1 pl-1 pr-2 text-xs ${
                        photo.status === "error"
                          ? "border-destructive/60"
                          : "border-border/70"
                      }`}
                    >
                      {/* Local preview — a plain img, the blob URL is ours. */}
                      <img
                        src={photo.preview}
                        alt=""
                        className="size-8 shrink-0 rounded-md object-cover"
                      />
                      <span className="max-w-40 truncate" title={photo.file.name}>
                        {photo.file.name}
                      </span>
                      {photo.status === "uploading" && (
                        <span className="text-muted-foreground">Uploading…</span>
                      )}
                      {photo.status === "done" && (
                        <Check
                          className="size-3.5 shrink-0 text-emerald-600"
                          aria-label="Uploaded"
                        />
                      )}
                      {photo.status === "error" && (
                        <span
                          className="text-destructive"
                          title={photo.error ?? "Upload failed"}
                        >
                          Failed
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${photo.file.name}`}
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
                <Label
                  htmlFor="equipment-image-urls"
                  className="text-xs text-muted-foreground"
                >
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
                disabled={saving || uploadingCount > 0}
                className="cursor-pointer bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
              >
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} photo${
                      uploadingCount > 1 ? "s" : ""
                    }…`
                  : saving
                    ? "Publishing..."
                    : "Publish Equipment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}