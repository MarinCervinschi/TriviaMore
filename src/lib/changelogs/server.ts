import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import { markChangelogsReadSchema } from "./schemas"
import { CHANGELOG_VERSIONS } from "./static"

async function getAuthUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Non autenticato")
  return { supabase, user }
}

export const getUnreadChangelogVersionsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<string[]> => {
  if (CHANGELOG_VERSIONS.length === 0) return []

  const { supabase, user } = await getAuthUser()

  const { data, error } = await supabase
    .from("user_changelog_reads")
    .select("version")
    .eq("user_id", user.id)
    .in("version", CHANGELOG_VERSIONS)

  if (error) throw new Error("Errore nel caricamento delle novità")

  const readVersions = new Set((data ?? []).map((r) => r.version))
  return CHANGELOG_VERSIONS.filter((v) => !readVersions.has(v))
})

export const markChangelogsReadFn = createServerFn({ method: "POST" })
  .inputValidator(markChangelogsReadSchema)
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const rows = data.versions.map((version) => ({
      user_id: user.id,
      version,
    }))

    const { error } = await supabase
      .from("user_changelog_reads")
      .upsert(rows, { onConflict: "user_id,version", ignoreDuplicates: true })

    if (error) throw new Error("Errore nel salvataggio")
  })
