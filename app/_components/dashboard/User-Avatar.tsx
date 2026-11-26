"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// User-er image dekhay; image na thakle ba broken hole initials dekhay.
// Which URL failed is remembered (not just "something failed"), so a freshly
// uploaded ImgBB avatar always renders even if an earlier one was broken.
export function UserAvatar({
          src,
          name,
          className,
}: {
          src?: string | null
          name?: string | null
          className?: string
}) {
          const [failedSrc, setFailedSrc] = useState<string | null>(null)
          const initials =
                    (name ?? "U")
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0]?.toUpperCase())
                              .join("") || "U"

          const showImage = Boolean(src) && failedSrc !== src

          return (
                    <span
                              className={cn(
                                        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/90 text-sm font-bold text-white",
                                        className
                              )}
                    >
                              {showImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                                  src={src as string}
                                                  alt={name ?? "User"}
                                                  className="size-full object-cover"
                                                  onError={() => setFailedSrc(src ?? null)}
                                        />
                              ) : (
                                        initials
                              )}
                    </span>
          )
}
