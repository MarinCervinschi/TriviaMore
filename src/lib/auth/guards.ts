import { redirect } from "@tanstack/react-router"

import { getDb } from "@/db"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import { findProfile } from "./db/profiles"
import type { AuthUser } from "./types"

// Plain functions, not server functions: they are called from inside other
// handlers dozens of times, where an RPC-shaped call would be a round trip to
// ourselves. The `api/require-*.ts` wrappers exist for route `beforeLoad`, which
// also runs in the browser.

export function toAuthUser(profile: {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role: AuthUser["role"]
}): AuthUser {
  return {
    id: profile.id,
    email: profile.email ?? "",
    name: profile.name,
    image: profile.image,
    role: profile.role,
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const profile = await findProfile(getDb(), user.id)
  return profile ? toAuthUser(profile) : null
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) throw redirect({ href: "/auth/login" })
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role === "STUDENT") throw redirect({ to: "/user" })
  return user
}

export async function requireSuperadmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== "SUPERADMIN") throw redirect({ to: "/user" })
  return user
}

export async function requireGuest(): Promise<void> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) throw redirect({ to: "/user" })
}
