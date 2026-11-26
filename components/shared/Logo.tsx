import Link from "next/link"
import { Cog, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Where the logo sits: "brand" on the yellow navbar, "dark" on the dark footer.
 * Only the colours that must stay readable on the background change — the mark
 * itself (red cog + wrench) and the wordmark are the same everywhere.
 */
type LogoTone = "brand" | "dark"

/** The Rent Gear logo. Used by both the navbar and the footer. */
export function Logo({ tone = "brand", className }: { tone?: LogoTone; className?: string }) {
  const onDark = tone === "dark"

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2", className)}>
      <span className="relative flex size-9 items-center justify-center">
        <Cog className="size-9 text-red-600" />
        <Wrench className={cn("absolute size-4", onDark ? "text-white" : "text-neutral-900")} />
      </span>
      <span className="text-xl font-bold tracking-tight">
        <span className={onDark ? "text-red-500" : "text-red-700"}>Rent</span>{" "}
        <span className={onDark ? "text-white" : "text-neutral-900"}>Gear</span>
      </span>
    </Link>
  )
}
