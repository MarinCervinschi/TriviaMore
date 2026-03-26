import { createServerFn } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  loginSchema,
  oauthProviderSchema,
  registerSchema,
} from "./schemas"
import type { AuthResult, AuthSession, AuthUser } from "./types"

function profileToAuthUser(profile: {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role: "SUPERADMIN" | "ADMIN" | "MAINTAINER" | "STUDENT"
}): AuthUser {
  return {
    id: profile.id,
    email: profile.email ?? "",
    name: profile.name,
    image: profile.image,
    role: profile.role,
  }
}

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession | null> => {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) return null

    const session = await supabase.auth.getSession()

    return {
      user: profileToAuthUser(profile),
      supabaseSession: session.data.session!,
    }
  },
)

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<AuthResult> => {
    const supabase = createServerSupabaseClient()

    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profilo utente non trovato" }
    }

    return { success: true, user: profileToAuthUser(profile) }
  })

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }): Promise<AuthResult> => {
    const supabase = createServerSupabaseClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!authData.user) {
      return { success: false, error: "Registrazione fallita" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profilo utente non trovato" }
    }

    return { success: true, user: profileToAuthUser(profile) }
  })

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false }
    }
    throw redirect({ to: "/" })
  },
)

export const oauthSignInFn = createServerFn({ method: "POST" })
  .inputValidator(oauthProviderSchema)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()

    const { data: authData, error } = await supabase.auth.signInWithOAuth({
      provider: data.provider,
      options: {
        redirectTo: `${process.env.VITE_APP_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const, url: authData.url }
  })

export const exchangeCodeFn = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(data.code)
  })
