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
