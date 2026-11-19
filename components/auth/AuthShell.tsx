import Image from "next/image"
import type { ReactNode } from "react"
import { Zap } from "lucide-react"

import { Logo } from "@/components/shared/Logo"

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
}

const categories = [
  { emoji: "🚜", label: "Rent" },
  { emoji: "🔧", label: "Parts" },
  { emoji: "📷", label: "Photography" },
  { emoji: "🌾", label: "Agriculture" },
]

const features = [
  { emoji: "✅", label: "Verified suppliers" },
  { emoji: "🔒", label: "Secure payments" },
  { emoji: "🚚", label: "Flexible delivery" },
  { emoji: "💬", label: "24/7 support" },
]

/**
 * Layout shared by the Sign In and Sign Up pages.
 * - Dark page with a gold glow in the top-left corner.
 * - One rounded card: yellow brand panel on the left, dark form panel on the right.
 * - Small screens: the brand panel is hidden and a slim brand bar sits on top of the form.
 */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] bg-[radial-gradient(circle_at_top_left,#a67c00,#121212_45%)] p-4 sm:p-8">
      {/* The gentle fade-in makes switching between Sign In and Sign Up feel smooth. */}
      <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="overflow-hidden rounded-3xl shadow-2xl lg:grid lg:grid-cols-2">
          {/* Left: brand panel. */}
          <aside className="hidden bg-brand lg:flex lg:flex-col">
            <div className="px-8 pt-8">
              <Logo />
            </div>

            <div className="px-8 pt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-brand">
                <Zap className="size-3" />
                AI-powered equipment marketplace
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900">
                Powering Your Equipment Journey
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-neutral-800">
                Rent, buy and discover tools, equipment and spare parts from
                trusted suppliers across Southeast Asia — all in just a few
                clicks.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <span
                    key={item.label}
                    className="rounded-full bg-white/50 px-3 py-1 text-xs font-semibold text-neutral-900 transition duration-200 hover:scale-105 hover:bg-white/70"
                  >
                    {item.emoji} {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center px-8">
              <Image
                src="/images/rent-gear.png"
                alt="A selection of rental equipment: excavator, generator, camera, power tools and more"
                width={1024}
                height={572}
                loading="eager"
                className="h-auto w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-8 pb-8 text-xs font-semibold text-neutral-900">
              {features.map((item) => (
                <span key={item.label}>
                  {item.emoji} {item.label}
                </span>
              ))}
            </div>
          </aside>

          {/* Right: heading and the auth form. */}
          <main className="flex flex-col bg-stone-900 text-white">
            {/* Slim brand bar for phones and tablets. */}
            <div className="flex items-center bg-brand px-4 py-3 lg:hidden">
              <Logo />
            </div>

            <div className="flex-1 p-6 sm:p-10">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-400">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}