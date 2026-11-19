"use client"

import Image from "next/image"
import {
  ArrowRight,
  CalendarDays,
  LayoutGrid,
  MapPin,
  Package,
  ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  BannerTab,
  CategoryOption,
  LocationOption,
  SearchBarProps,
  SearchFieldProps,
} from "@/lib/types"

const categories: CategoryOption[] = [
  { value: "agriculture", label: "Agriculture Equipment" },
  { value: "cleaning", label: "Cleaning Equipment" },
  { value: "construction", label: "Construction Equipment" },
  { value: "electronics", label: "Electronics" },
  { value: "events", label: "Event Equipment" },
  { value: "photography", label: "Photography Equipment" },
  { value: "vehicles", label: "Vehicles & Transportation" },
]

/** Bangladesh is the only supported location. */
const locations: LocationOption[] = [{ value: "bd", label: "Bangladesh" }]

/** Small circular Bangladesh flag shown inside the Location field. */
function BangladeshFlag() {
  return (
    <span
      aria-hidden="true"
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#006a4e]"
    >
      <span className="size-2.5 rounded-full bg-[#f42a41]" />
    </span>
  )
}

function Field({ icon: Icon, label, children }: SearchFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Icon className="size-3.5" />
        {label}
      </span>
      {children}
    </div>
  )
}

function SearchBar({ cta }: SearchBarProps) {
  return (
    // The card always stays white and light, even in dark mode,
    // because it sits on the yellow brand background.
    <div className="rounded-2xl bg-white p-4 text-neutral-900 shadow-xl ring-1 ring-black/5 [color-scheme:light] sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end lg:gap-3">
        {/* SelectTrigger's built-in height is variant-prefixed, so the same
            variant is repeated here to override it. */}
        <Field icon={LayoutGrid} label="Category">
          <Select>
            <SelectTrigger className="h-11 w-full border-neutral-200 bg-white placeholder:text-neutral-500 data-placeholder:text-neutral-500 data-[size=default]:h-11 dark:bg-white [&_svg]:text-neutral-500">
              <SelectValue placeholder="Search ..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field icon={MapPin} label="Location">
          <Select items={locations} defaultValue="bd">
            <SelectTrigger className="h-11 w-full border-neutral-200 bg-white placeholder:text-neutral-500 data-placeholder:text-neutral-500 data-[size=default]:h-11 dark:bg-white [&_svg]:text-neutral-500">
              <span className="flex items-center gap-1.5">
                <BangladeshFlag />
                <SelectValue placeholder="Select Location" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  <span className="flex items-center gap-1.5">
                    <BangladeshFlag />
                    {location.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field icon={CalendarDays} label="Start Date">
          <Input
            type="date"
            className="h-11 border-neutral-200 bg-white placeholder:text-neutral-500 dark:bg-white"
          />
        </Field>

        <Field icon={CalendarDays} label="End Date">
          <Input
            type="date"
            className="h-11 border-neutral-200 bg-white placeholder:text-neutral-500 dark:bg-white"
          />
        </Field>

        <Button className="h-11 w-full bg-brand text-neutral-900 hover:bg-brand-hover sm:col-span-2 lg:col-span-1">
          {cta}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

const tabs: BannerTab[] = [
  { value: "rent", label: "Rent", icon: LayoutGrid, cta: "Let's Rent" },
  { value: "buy", label: "Buy", icon: ShoppingCart, cta: "Let's Buy" },
  {
    value: "parts",
    label: "Parts & Accessories",
    shortLabel: "Parts",
    icon: Package,
    cta: "Search Parts",
  },
]

export function Banner() {
  return (
    <section className="bg-brand">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-14 text-center sm:px-6 sm:pt-12 sm:pb-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          Powering Your Equipment Journey
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-800 sm:text-base">
          The largest AI-powered equipment marketplace in the region. Discover,
          rent, and buy equipment, tools, and spare parts from trusted suppliers
          across Southeast Asia — all in just a few clicks.
        </p>

        <div className="relative mt-8 w-full sm:mt-10">
          <Image
            src="/images/rent-gear.png"
            alt="A selection of rental equipment: excavator, generator, camera, power tools and more"
            width={1024}
            height={572}
            loading="eager"
            className="h-auto w-full"
          />

          {/* On lg and up the search card floats over the middle of the image,
              exactly like the reference design. Below lg it flows underneath,
              so the whole image stays visible on small screens. */}
          <div className="mt-6 lg:absolute lg:inset-x-0 lg:top-[22%] lg:mt-0">
            <Tabs defaultValue="rent" className="gap-0">
              {/* `group-data-horizontal/tabs:h-10` overrides the built-in h-8 (same variant = same class wins). */}
              <TabsList className="group-data-horizontal/tabs:h-10 gap-1 self-start rounded-xl bg-neutral-900 p-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-1.5 rounded-lg px-2 text-[11px] font-semibold tracking-wide uppercase text-white/70 hover:bg-white/10 hover:text-white data-active:bg-white data-active:text-neutral-900 data-active:shadow-sm dark:data-active:bg-white dark:data-active:text-neutral-900 sm:px-3 sm:text-xs"
                  >
                    <tab.icon className="size-4" />
                    <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="pt-3 sm:pt-4">
                  <SearchBar cta={tab.cta} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  )
}
