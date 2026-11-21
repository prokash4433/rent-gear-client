"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"

import { EquipmentResults } from "@/app/browse-equipments/equipment-results"
import { Button } from "@/components/ui/button"
import {
          Empty,
          EmptyContent,
          EmptyDescription,
          EmptyHeader,
          EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { getEquipments, normalizeEquipments } from "@/lib/api/equipments"
import { getFavourites } from "@/lib/api/favourites"
import { useSession } from "@/lib/auth-client"
import type { EquipmentListItem } from "@/lib/types"

const brandButtonClass =
          "bg-brand text-neutral-900 hover:bg-brand-hover dark:bg-brand dark:text-neutral-900 dark:hover:bg-brand-hover"

export default function MyFavoritesPage() {
          const { data: session, isPending } = useSession()
          const email = session?.user?.email ?? ""

          // null = still loading, [] = nothing saved yet.
          const [items, setItems] = useState<EquipmentListItem[] | null>(null)

          // Load the saved equipment: favourites first, then the listings themselves.
          useEffect(() => {
                    if (!email) return
                    let cancelled = false

                    ;(async () => {
                              try {
                                        const favourites = await getFavourites(email)
                                        const all = await getEquipments("status=approved")
                                        const ids = new Set(
                                                  favourites.map((favourite) => favourite.equipmentId)
                                        )
                                        if (!cancelled) {
                                                  setItems(
                                                            normalizeEquipments(all).filter((item) =>
                                                                      ids.has(item.id)
                                                            )
                                                  )
                                        }
                              } catch {
                                        if (!cancelled) setItems([])
                              }
                    })()

                    return () => {
                              cancelled = true
                    }
          }, [email])

          function handleFavouriteRemoved(equipmentId: string) {
                    setItems(
                              (current) =>
                                        current?.filter((item) => item.id !== equipmentId) ?? current
                    )
          }

          return (
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-6">
                              <div>
                                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                                                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand/20">
                                                            <Heart className="size-5 text-brand-hover" />
                                                  </span>
                                                  My Favorites
                                        </h1>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                                  Equipment you saved for later.
                                        </p>
                              </div>

                              {/* Still waiting for the session or the data. */}
                              {isPending || (email && items === null) ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                  <Spinner />
                                                  Loading your favourites...
                                        </div>
                              ) : !email ? (
                                        <Empty>
                                                  <EmptyHeader>
                                                            <EmptyTitle>Sign in to see your favorites</EmptyTitle>
                                                            <EmptyDescription>
                                                                      Save equipment you like and
                                                                      find it all here.
                                                            </EmptyDescription>
                                                  </EmptyHeader>
                                                  <EmptyContent>
                                                            <Button
                                                                      nativeButton={false}
                                                                      render={<Link href="/sign-in" />}
                                                                      className={brandButtonClass}
                                                            >
                                                                      Log in
                                                            </Button>
                                                  </EmptyContent>
                                        </Empty>
                              ) : (items?.length ?? 0) === 0 ? (
                                        <Empty>
                                                  <EmptyHeader>
                                                            <EmptyTitle>No favorites yet</EmptyTitle>
                                                            <EmptyDescription>
                                                                      Browse the equipment page and
                                                                      tap the heart on anything you
                                                                      want to keep.
                                                            </EmptyDescription>
                                                  </EmptyHeader>
                                                  <EmptyContent>
                                                            <Button
                                                                      nativeButton={false}
                                                                      render={
                                                                                <Link href="/browse-equipments" />
                                                                      }
                                                                      className={brandButtonClass}
                                                            >
                                                                      Browse Equipment
                                                            </Button>
                                                  </EmptyContent>
                                        </Empty>
                              ) : (
                                        <EquipmentResults
                                                  items={items ?? []}
                                                  onFavouriteRemoved={handleFavouriteRemoved}
                                        />
                              )}
                    </div>
          )
}
