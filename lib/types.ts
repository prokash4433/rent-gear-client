import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

 

/** A link in the navbar and in the mobile drawer menu. */
export type NavLink = {
  label: string
  href: string
}

/** An equipment category offered in the search bar. */
export type CategoryOption = {
  value: string
  label: string
}

/** A country offered in the location picker. */
export type LocationOption = {
  value: string
  label: string
}

/** One of the tabs above the search bar. */
export type BannerTab = {
  value: string
  label: string
  /** Shorter label shown on small screens so the tab row never overflows. */
  shortLabel?: string
  icon: LucideIcon
  /** Label of the submit button used for this tab. */
  cta: string
}

/** A labelled control (select or input) inside the search bar card. */
export type SearchFieldProps = {
  icon: LucideIcon
  label: string
  children: ReactNode
}

/** Props of the white search card. */
export type SearchBarProps = {
  cta: string
}

/* ---------- Authentication forms ---------- */

/** Whether a user signs up to rent equipment (customer), list it (owner), or administers the site (admin). */
export type UserRole = "customer" | "owner" | "admin"

/** Registered user details for Admin user management table. */
export type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
  emailVerified?: boolean
  createdAt: string
  updatedAt?: string
}

/* ---------- Dashboard sidebar ---------- */

/** One item in the dashboard sidebar menu. */
export type DashboardMenuItem = {
  /** Label shown in the sidebar. */
  name: string
  /** Where the item links to. */
  url: string
  /** Lucide icon shown next to the label. */
  icon: LucideIcon
}

/** Sidebar menu items grouped by the user's role. */
export type MenuItemsByRole = Record<UserRole, DashboardMenuItem[]>

/** Values collected by the Sign In form. */
export type SignInFormValues = {
  email: string
  password: string
}

/** Values collected by the Sign Up form. */
export type SignUpFormValues = {
  name: string
  email: string
  photo: string
  password: string
}

/* ---------- Owner: Add Equipment form ---------- */

/** Values collected by the owner's Add Equipment form. */
export type EquipmentFormValues = {
  /** Equipment Name */
  name: string
  /** Category (value from the category dropdown) */
  category: string
  description: string
  /** Kept as a string because that is what a text input holds. */
  rentalPrice: string
  /** Rental Type (Hourly / Daily / Weekly / Monthly) */
  rentalType: string
  /** Available Quantity, also a string for the same reason. */
  quantity: string
  brand: string
  model: string
  /** Condition (Excellent / Good / Fair) */
  condition: string
  location: string
  /** Image URLs typed in the textarea, one per line. */
  imageUrls: string
  terms: string
}

/**
 * What the Add Equipment form sends to the API.
 * Same as EquipmentFormValues, but the image URLs are already split into an
 * array and the picked photo names are included.
 */
export type EquipmentPayload = Omit<EquipmentFormValues, "imageUrls"> & {
  imageUrls: string[]
  photos: string[]
  /** Email of the owner who published the listing (from the session). */
  ownerEmail: string
}

/** The response MongoDB sends back after inserting one document. */
export type CreateEquipmentResult = {
  acknowledged: boolean
  insertedId: string
}

/* ---------- Owner: All Equipment table ---------- */

/** Admin approval status of a listing. New listings stay "pending". */
export type EquipmentStatus = "pending" | "approved" | "rejected"

/**
 * One row of the owner's All Equipment table.
 * Same fields as the Add Equipment form, plus the id, the approval status
 * (defaults to "pending"), and the owner who listed it.
 */
export type EquipmentListItem = EquipmentFormValues & {
  id: string
  /** Not set yet on new listings -> displayed as "pending". */
  status?: EquipmentStatus
  ownerEmail: string
}

/**
 * One document as GET /equipments returns it: an EquipmentPayload plus the
 * MongoDB `_id`. Everything is optional because documents created before a
 * field existed (ownerEmail, status, ...) do not have it.
 */
export type EquipmentDocument = Omit<Partial<EquipmentPayload>, "imageUrls"> & {
  _id: string
  /** The form kept one URL per line; the API sends an array or a string. */
  imageUrls?: string[] | string
  /** Admin approval status; missing on older documents. */
  status?: EquipmentStatus
}

/** Validation message for one field. An empty object means "no errors". */
export type FormErrors<T> = Partial<Record<keyof T, string>>

/** Result of checking the three Sign Up password rules. */
export type PasswordCheck = {
  hasUppercase: boolean
  hasLowercase: boolean
  hasMinLength: boolean
}

/* ---------- Favourites ---------- */

/** One row of the favourites collection: a user saved one equipment. */
export type FavouriteDocument = {
  _id: string
  /** The `_id` of the saved equipment, kept as a string. */
  equipmentId: string
  /** Email of the user who saved it. */
  userEmail: string
  createdAt?: string
}
