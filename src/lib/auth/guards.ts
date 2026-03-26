import { createServerFn } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { AuthUser } from "./types"

export const requireAuth = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser> => {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw redirect({ href: "/auth/login" })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      throw redirect({ href: "/auth/login" })
    }

    return {
      id: profile.id,
      email: profile.email ?? "",
      name: profile.name,
      image: profile.image,
      role: profile.role,
    }
  },
)

export const requireAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser> => {
    const user = await requireAuth()

    if (user.role === "STUDENT") {
      throw redirect({ to: "/" })
    }

    return user
  },
)

export const requireGuest = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      throw redirect({ to: "/" })
    }
  },
)
