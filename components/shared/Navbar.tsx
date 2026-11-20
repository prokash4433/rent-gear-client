"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { LogOut, Menu, Moon, Search, Sun, User, UserPlus } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Logo } from "@/components/shared/Logo"
import { cn } from "@/lib/utils"
import type { NavLink } from "@/lib/types"
import { useSession, signOut } from "@/lib/auth-client"



/** Dark text is forced everywhere: the navbar always sits on the yellow brand background. */
const onBrand = "text-neutral-900 hover:bg-black/5"

function ThemeToggle() {
  const { setTheme } = useTheme()

  // The active side is styled with the `dark:` variant, so no client
  // state is needed and there is no hydration mismatch.
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-neutral-900 p-1">
      <button
        type="button"
        aria-label="Use light theme"
        onClick={() => setTheme("light")}
        className="flex size-6 items-center justify-center rounded-full bg-white text-neutral-900 dark:bg-transparent dark:text-white/70"
      >
        <Sun className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Use dark theme"
        onClick={() => setTheme("dark")}
        className="flex size-6 items-center justify-center rounded-full text-white/70 dark:bg-white dark:text-neutral-900"
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  )
}

function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" className={cn("lg:hidden", onBrand)} />
        }
      >
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rent Gear</DrawerTitle>
        </DrawerHeader>

        <nav className="flex flex-col gap-1 px-4 pb-2">
          {navLinks.map((link) => (
            <DrawerClose
              key={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                />
              }
            >
              {link.label}
            </DrawerClose>
          ))}
        </nav>

        <DrawerFooter className="pt-0">
          <DrawerClose
            nativeButton={false}
            render={
              <Link href="/sign-in" className={buttonVariants({ variant: "outline" })} />
            }
          >
            <User className="size-4" />
            Log in
          </DrawerClose>
          <DrawerClose
            nativeButton={false}
            render={<Link href="/sign-up" className={buttonVariants({ variant: "default" })} />}
          >
            <UserPlus className="size-4" />
            Sign Up
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function Navbar() {
  const { data: session } = useSession()

  const navLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "All Equipment", href: "/equipment" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Dashboard", href: `/dashboard/${session?.user.role || 'customer'}` },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 bg-brand">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="ml-2 hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-neutral-800 transition-colors hover:text-neutral-950",
                link.href === "/" && "font-semibold text-neutral-950"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Divider: plain div so it stays vertically centered */}
          <div
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px shrink-0 self-center bg-black/20 sm:block"
          />

          <Button variant="ghost" size="icon" aria-label="Search" className={onBrand}>
            <Search className="size-4" />
          </Button>

          {session?.user ? (
            <>
              <span className="text-[#EDEDEF]">Welcome, {session.user.name}!</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors md:inline-flex"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border">
                  <LogOut className="size-4 text-[#e60023]" strokeWidth={2} />
                </span>
                <span className="text-sm font-bold text-[#e60023]">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost" }), "hidden md:inline-flex", onBrand)}
              >
                <User className="size-4" />
                Log in
              </Link>

              <Link
                href="/sign-up"
                className={cn(buttonVariants({ variant: "ghost" }), "hidden md:inline-flex", onBrand)}
              >
                <UserPlus className="size-4" />
                Sign Up
              </Link>
            </>
          )}

          <MobileMenu navLinks={navLinks} />
        </div>
      </div>
    </header>
  )
}