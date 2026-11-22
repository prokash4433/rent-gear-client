"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// User-er image dekhay; image na thakle ba broken hole initials dekhay.
export function UserAvatar({
          src,
          name,
          className,
}: {
          src?: string | null
          name?: string | null
          className?: string
}) {
          const [failed, setFailed] = useState(false)
          const initials =
                    (name ?? "U")
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0]?.toUpperCase())
                              .join("") || "U"

          return (
                    <span
                              className={cn(
                                        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/90 text-sm font-bold text-white",
                                        className
                              )}
                    >
                              {src && !failed ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                                  src={src}
                                                  alt={name ?? "User"}
                                                  className="size-full object-cover"
                                                  onError={() => setFailed(true)}
                                        />
                              ) : (
                                        initials
                              )}
                    </span>
          )
}