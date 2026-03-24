import type { Database } from "@/lib/supabase/database.types"
import type { Session } from "@supabase/supabase-js"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type UserRole = Database["public"]["Enums"]["role"]

export type AuthUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
}

export type AuthSession = {
  user: AuthUser
  supabaseSession: Session
}

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string }
