import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/lib/legal/versions"
import {
  loginSchema,
  oauthProviderSchema,
  registerSchema,
} from "./schemas"
import type { AuthResult, AuthSession, AuthUser, SignupResult } from "./types"
import type { EmailOtpType } from "@supabase/supabase-js"

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
  .handler(async ({ data }): Promise<SignupResult> => {
    const supabase = createServerSupabaseClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!authData.user) {
      return { success: false, error: "Registrazione fallita" }
    }

    if (!authData.session) {
      // Supabase returns 200 with an empty identities array when the email is
      // already registered (anti-enumeration). No confirmation email is sent.
      if (authData.user.identities?.length === 0) {
        return { success: false, error: "Email gia' registrata" }
      }

      return {
        success: true,
        status: "pending_email_confirmation",
        email: data.email,
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profilo utente non trovato" }
    }

    return {
      success: true,
      status: "logged_in",
      user: profileToAuthUser(profile),
    }
  })

export const resendConfirmationFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: data.email,
    })

    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const }
  })

const allowedOtpTypes: ReadonlyArray<EmailOtpType> = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]

export const verifyEmailFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { token_hash: string; type: string }) => data,
  )
  .handler(async ({ data }) => {
    if (!allowedOtpTypes.includes(data.type as EmailOtpType)) {
      return { success: false as const, error: "Tipo di verifica non valido" }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.verifyOtp({
      type: data.type as EmailOtpType,
      token_hash: data.token_hash,
    })

    if (error) {
      return { success: false as const, error: error.message }
    }

    return { success: true as const }
  })

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()
    return { success: !error }
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
