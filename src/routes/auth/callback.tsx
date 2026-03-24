import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"

const exchangeCodeFn = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(data.code)
  })

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string) ?? "",
  }),
  beforeLoad: async ({ search }) => {
    if (search.code) {
      await exchangeCodeFn({ data: { code: search.code } })
    }
    throw redirect({ to: "/" })
  },
  component: () => null,
})
