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

/**
 * One document as GET /equipments returns it, loosely typed: every field is
 * optional because documents created before a field existed (ownerEmail,
 * status, ...) do not have it, and the API may send numbers or strings.
 */
export type RawEquipment = {
  _id?: string
  id?: string
  name?: string
  category?: string
  description?: string
  rentalPrice?: string | number
  rentalType?: string
  quantity?: string | number
  brand?: string
  model?: string
  condition?: string
  location?: string
  imageUrls?: string[] | string
  terms?: string
  status?: EquipmentStatus
  ownerEmail?: string
  photos?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

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

/* ---------- Admin Rentals / Bookings ---------- */
export type RentalStatus = "pending" | "confirmed" | "cancelled" | "completed"

export type RentalItem = {
  id: string
  equipmentId?: string
  equipmentName: string
  equipmentImage?: string
  ownerId?: string
  ownerEmail?: string
  renterName: string
  renterEmail: string
  startDate: string
  endDate: string
  durationText?: string
  quantity: number
  totalAmount: number
  paymentStatus: "paid" | "unpaid"
  status: RentalStatus
  contactNumber: string
  deliveryAddress: string
  notes?: string
  createdAt: string
}

/* ---------- Customer: dashboard & My Bookings ---------- */

/** Lifecycle of a booking as stored in the bookings collection. */
export type BookingStatus =
  | "unpaid"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"

/** One booking as the customer sees it on My Bookings and the dashboard. */
export type MyBooking = {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentImage?: string
  startDate: string
  endDate: string
  quantity: number
  rentalType: string
  periods: number
  totalAmount: number
  deliveryAddress: string
  contactNumber: string
  notes?: string
  status: BookingStatus
  paymentStatus: "paid" | "unpaid"
  createdAt: string
}

/** Everything the customer dashboard renders, computed from live data. */
export type CustomerDashboardData = {
  stats: {
    totalBookings: number
    favoriteItems: number
    totalSpent: number
    reviews: number
    pending: number
    confirmed: number
    cancelled: number
    completed: number
  }
  /** Bookings created per month for the last 6 months, oldest month first. */
  monthly: { month: string; bookings: number }[]
  /** Status breakdown feeding the donut chart. */
  statusBreakdown: { name: string; value: number; color: string }[]
  /** The 5 newest bookings. */
  recent: MyBooking[]
}

/** Activity summary shown on the admin Manage User page. */
export type UserActivityStats = {
  totalBookings: number
  activeBookings: number
  totalSpent: number
  favoriteItems: number
}
