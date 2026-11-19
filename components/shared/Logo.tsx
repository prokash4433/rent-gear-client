import Link from "next/link"
import { Cog, Wrench } from "lucide-react"

/** Rent Gear logo. It always sits on the yellow brand background, so the text stays dark. */
export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="relative flex size-9 items-center justify-center">
        <Cog className="size-9 text-red-600" />
        <Wrench className="absolute size-4 text-neutral-900" />
      </span>
      <span className="text-xl font-bold tracking-tight">
        <span className="text-red-700">Rent</span>{" "}
        <span className="text-neutral-900">Gear</span>
      </span>
    </Link>
  )
}
