import { createMiddleware } from "@tanstack/react-start"

import { requireAdmin, requireSuperadmin } from "@/lib/auth/guards"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Unauthorized } from "../errors"

// Identity only. Auth stays on supabase-js; the role and the profile live in
// the database and are loaded by the guards that actually need them.
type SessionUser = {
  id: string
  email: string | null
}

async function readSessionUser(): Promise<SessionUser | null> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return { id: user.id, email: user.email ?? null }
}

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const user = await readSessionUser()
    if (!user) throw new Unauthorized()
    return next({ context: { user } })
  },
)

// For endpoints that serve anonymous visitors too: an absent user narrows the
// result instead of failing.
export const optionalAuthMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => next({ context: { user: await readSessionUser() } }))

// These two load the profile, so `context.user` is the full AuthUser with its
// role. They redirect rather than throw, matching the guards they wrap: an
// endpoint reached without the right role is a navigation mistake, not a
// failure the UI should report.
export const adminMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => next({ context: { user: await requireAdmin() } }),
)

export const superadminMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => next({ context: { user: await requireSuperadmin() } }))
