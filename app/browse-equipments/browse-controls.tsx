"use client"

import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
          Select,
          SelectContent,
          SelectItem,
          SelectTrigger,
          SelectValue,
} from "@/components/ui/select"

/** The search params of the current URL, as the server component sees them. */
export type BrowseParams = Record<string, string | string[] | undefined>

const categoryOptions = [
          { value: "agriculture", label: "Agriculture Equipment" },
          { value: "cleaning", label: "Cleaning Equipment" },
          { value: "construction", label: "Construction Equipment" },
          { value: "electronics", label: "Electronics" },
          { value: "events", label: "Event Equipment" },
          { value: "photography", label: "Photography Equipment" },
          { value: "vehicles", label: "Vehicles & Transportation" },
]

const rentalTypeOptions = ["Hourly", "Daily", "Weekly", "Monthly"]

const sortOptions = [
          { value: "default", label: "Default" },
          { value: "price-asc", label: "Price: Low to High" },
          { value: "price-desc", label: "Price: High to Low" },
          { value: "newest", label: "Recently Added" },
]

/** One param value -> a list (a param can repeat in the URL). */
function asList(value: string | string[] | undefined): string[] {
          if (Array.isArray(value)) return value
          if (value) return [value]
          return []
}

/** Current params + changes -> a fresh query string. Empty values are dropped. */
function buildQuery(params: BrowseParams, patch: BrowseParams): string {
          const merged: BrowseParams = { ...params, ...patch }
          const query = new URLSearchParams()
          for (const [key, value] of Object.entries(merged)) {
                    if (value === undefined || value === "") continue
                    if (Array.isArray(value)) {
                              value.forEach((item) => item && query.append(key, item))
                    } else {
                              query.set(key, value)
                    }
          }
          return query.toString()
}

/** ---------- Search box + sort dropdown ---------- */

export function SearchSortBar({ params }: { params: BrowseParams }) {
          const router = useRouter()
          const search = asList(params.search)[0] ?? ""
          const sort = asList(params.sort)[0] ?? "default"

          function apply(patch: BrowseParams) {
                    router.replace(`/browse-equipments?${buildQuery(params, patch)}`, {
                              scroll: false,
                    })
          }

          return (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <form
                                        className="flex flex-1 items-center gap-2"
                                        onSubmit={(event) => {
                                                  event.preventDefault()
                                                  const data = new FormData(event.currentTarget)
                                                  apply({
                                                            search: String(
                                                                      data.get("search") ?? ""
                                                            ).trim(),
                                                  })
                                        }}
                              >
                                        <div className="relative flex-1">
                                                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                  <Input
                                                            name="search"
                                                            defaultValue={search}
                                                            placeholder="Search by equipment name or location..."
                                                            className="h-11 pl-9"
                                                  />
                                        </div>
                                        <Button type="submit" className="h-11 bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover">
                                                  Search
                                        </Button>
                              </form>

                              <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                                  Sort by
                                        </span>
                                        <Select
                                                  items={sortOptions}
                                                  value={sort}
                                                  onValueChange={(value) =>
                                                            apply({
                                                                      sort:
                                                                                String(value) ===
                                                                                "default"
                                                                                          ? undefined
                                                                                          : String(
                                                                                                      value
                                                                                            ),
                                                            })
                                                  }
                                        >
                                                  <SelectTrigger className="h-11 w-52 cursor-pointer">
                                                            <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                            {sortOptions.map((option) => (
                                                                      <SelectItem
                                                                                key={option.value}
                                                                                value={option.value}
                                                                                className="cursor-pointer"
                                                                      >
                                                                                {option.label}
                                                                      </SelectItem>
                                                            ))}
                                                  </SelectContent>
                                        </Select>
                              </div>
                    </div>
          )
}

/** ---------- Filters sidebar ---------- */

export function BrowseFilters({ params }: { params: BrowseParams }) {
          const router = useRouter()
          const categories = asList(params.category)
          const rentalTypes = asList(params.rentalType)
          const available = asList(params.available)[0] === "true"
          const minPrice = asList(params.minPrice)[0] ?? ""
          const maxPrice = asList(params.maxPrice)[0] ?? ""

          function apply(patch: BrowseParams) {
                    router.replace(`/browse-equipments?${buildQuery(params, patch)}`, {
                              scroll: false,
                    })
          }

          /** Add or remove one value from a multi-value param. */
          function toggle(list: string[], value: string, on: boolean): string[] {
                    return on ? [...list, value] : list.filter((item) => item !== value)
          }

          function clearFilters() {
                    router.replace("/browse-equipments", { scroll: false })
          }

          return (
                    <aside className="w-full shrink-0 lg:w-64">
                              <div className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                            <SlidersHorizontal className="size-4" />
                                                            Filters
                                                  </h2>
                                                  <button
                                                            type="button"
                                                            onClick={clearFilters}
                                                            className="text-xs font-medium text-brand-hover hover:underline"
                                                  >
                                                            Clear All
                                                  </button>
                                        </div>

                                        {/* ---------- Category ---------- */}
                                        <fieldset className="flex flex-col gap-2">
                                                  <legend className="mb-1 text-sm font-semibold">
                                                            Category
                                                  </legend>
                                                  {categoryOptions.map((category) => (
                                                            <label
                                                                      key={category.value}
                                                                      className="flex cursor-pointer items-center gap-2 text-sm"
                                                            >
                                                                      <Checkbox
                                                                                checked={categories.includes(
                                                                                          category.value
                                                                                )}
                                                                                onCheckedChange={(
                                                                                          checked
                                                                                ) =>
                                                                                          apply({
                                                                                                    category: toggle(
                                                                                                              categories,
                                                                                                              category.value,
                                                                                                              checked
                                                                                                    ),
                                                                                          })
                                                                                }
                                                                      />
                                                                      {category.label}
                                                            </label>
                                                  ))}
                                        </fieldset>

                                        {/* ---------- Rental Type ---------- */}
                                        <fieldset className="flex flex-col gap-2">
                                                  <legend className="mb-1 text-sm font-semibold">
                                                            Rental Type
                                                  </legend>
                                                  {rentalTypeOptions.map((type) => (
                                                            <label
                                                                      key={type}
                                                                      className="flex cursor-pointer items-center gap-2 text-sm"
                                                            >
                                                                      <Checkbox
                                                                                checked={rentalTypes.includes(
                                                                                          type
                                                                                )}
                                                                                onCheckedChange={(
                                                                                          checked
                                                                                ) =>
                                                                                          apply({
                                                                                                    rentalType: toggle(
                                                                                                              rentalTypes,
                                                                                                              type,
                                                                                                              checked
                                                                                                    ),
                                                                                          })
                                                                                }
                                                                      />
                                                                      {type}
                                                            </label>
                                                  ))}
                                        </fieldset>

                                        {/* ---------- Price Range ---------- */}
                                        <form
                                                  className="flex items-end gap-2"
                                                  onSubmit={(event) => {
                                                            event.preventDefault()
                                                            const data = new FormData(
                                                                      event.currentTarget
                                                            )
                                                            apply({
                                                                      minPrice: String(
                                                                                data.get(
                                                                                          "minPrice"
                                                                                ) ?? ""
                                                                      ).trim(),
                                                                      maxPrice: String(
                                                                                data.get(
                                                                                          "maxPrice"
                                                                                ) ?? ""
                                                                      ).trim(),
                                                            })
                                                  }}
                                        >
                                                  <div className="flex flex-1 flex-col gap-1.5">
                                                            <label
                                                                      htmlFor="filter-min-price"
                                                                      className="text-xs text-muted-foreground"
                                                            >
                                                                      Min (৳)
                                                            </label>
                                                            <Input
                                                                      id="filter-min-price"
                                                                      name="minPrice"
                                                                      type="number"
                                                                      min="0"
                                                                      defaultValue={minPrice}
                                                                      placeholder="0"
                                                                      className="h-9"
                                                            />
                                                  </div>
                                                  <div className="flex flex-1 flex-col gap-1.5">
                                                            <label
                                                                      htmlFor="filter-max-price"
                                                                      className="text-xs text-muted-foreground"
                                                            >
                                                                      Max (৳)
                                                            </label>
                                                            <Input
                                                                      id="filter-max-price"
                                                                      name="maxPrice"
                                                                      type="number"
                                                                      min="0"
                                                                      defaultValue={maxPrice}
                                                                      placeholder="Any"
                                                                      className="h-9"
                                                            />
                                                  </div>
                                                  <Button
                                                            type="submit"
                                                            size="sm"
                                                            className="h-9 bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"
                                                  >
                                                            Apply
                                                  </Button>
                                        </form>

                                        {/* ---------- Availability ---------- */}
                                        <fieldset className="flex flex-col gap-2">
                                                  <legend className="mb-1 text-sm font-semibold">
                                                            Availability
                                                  </legend>
                                                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                                                            <Checkbox
                                                                      checked={available}
                                                                      onCheckedChange={(checked) =>
                                                                                apply({
                                                                                          available: checked
                                                                                                    ? "true"
                                                                                                    : undefined,
                                                                                })
                                                                      }
                                                            />
                                                            Available only
                                                  </label>
                                        </fieldset>
                              </div>
                    </aside>
          )
}
