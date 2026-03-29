import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"

export const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const catalogAdmin = supabaseAdmin.schema("catalog")
export const quizAdmin = supabaseAdmin.schema("quiz")
