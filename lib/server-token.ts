import "server-only"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Mints a short-lived JWT for the *current request's* better-auth session.
 *
 * Server-only (Server Components, Route Handlers and Server Actions) — the
 * browser equivalent lives in `lib/api-client.ts`. Used to call the Express
 * API with an `Authorization: Bearer <token>` header, exactly like a client
 * would, so the same `verifyToken` middleware guards every caller.
 */
export async function getServerAccessToken(): Promise<string | null> {
  try {
    const result = await auth.api.getToken({ headers: await headers() })
    return result?.token ?? null
  } catch (error) {
    // Never swallow Next's dynamic-usage errors (see `lib/auth-guard.ts`):
    // they tell Next to render this route per request instead of statically.
    if (
      error instanceof Error &&
      ((typeof (error as Error & { digest?: unknown }).digest === "string" &&
        String((error as Error & { digest?: string }).digest).startsWith("DYNAMIC")) ||
        /dynamic server usage/i.test(error.message))
    ) {
      throw error
    }
    // No session (signed out) or the token could not be signed.
    return null
  }
}
