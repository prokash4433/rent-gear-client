import { BrowseFilters, SearchSortBar } from "./browse-controls"
import { EquipmentResults } from "./equipment-results"
import { requireSession } from "@/lib/auth-guard"
import { getServerAccessToken } from "@/lib/server-token"
import { getEquipments, normalizeEquipments } from "@/lib/api/equipments"

/** Only these params are forwarded to the API. */
const filterParams = [
          "search",
          "category",
          "rentalType",
          "minPrice",
          "maxPrice",
          "available",
          "sort",
]

/**
 * Private, per-user page: rendered per request (the session check and the
 * JWT for the API call both need the incoming request).
 */
export const dynamic = "force-dynamic"

const BrowseEquipmentsPage = async ({
          searchParams,
}: {
          searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
          // Private page: signed-out visitors never reach the listings.
          await requireSession()

          const params = await searchParams

          // Build the API query string from the whitelisted params only.
          const query = new URLSearchParams()
          for (const key of filterParams) {
                    const value = params[key]
                    if (Array.isArray(value)) {
                              value.forEach((item) => item && query.append(key, item))
                    } else if (value) {
                              query.set(key, value)
                    }
          }
          // The public page only shows approved listings
          // (documents without a status field count as approved).
          query.set("status", "approved")

          // Server-side call to the Express API — send this request's JWT.
          const token = await getServerAccessToken()
          const raw = await getEquipments(query.toString(), token)
          const items = normalizeEquipments(raw)

          return (
                    <div>
                              {/* ---------- Hero ---------- */}
          <section className="bg-brand">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          All Equipment
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-800 sm:text-base">
          Browse every listing in one place —
          search by name or location, filter by
          category, rental type, price and
          availability, then rent the gear you need.
                                                  </p>
                                        </div>
                              </section>

                              {/* ---------- Search + filters + results ---------- */}
                              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
                                        <SearchSortBar
                                                  key={String(params.search ?? "")}
                                                  params={params}
                                        />

          <div className="flex flex-col gap-6 lg:flex-row">
          <BrowseFilters params={params} />

          <div className="min-w-0 flex-1">
                                                             
<EquipmentResults
                                                                      key={query.toString()}
                                                                      items={items}
                                                            />
                                                  </div>
                                        </div>
                              </div>
                    </div>
          )
}

export default BrowseEquipmentsPage
