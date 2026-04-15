import { createServerFn } from "@tanstack/react-start"

import { requireSuperadmin } from "@/lib/auth/guards"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { broadcastToAllUsers } from "@/lib/notifications/helpers"
import { changelogSchema, updateChangelogSchema } from "./schemas"

// ─── Public ───

export const getPublishedChangelogsFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("changelogs")
    .select("*")
    .eq("is_draft", false)
    .order("published_at", { ascending: false })

  if (error) throw new Error("Errore nel caricamento delle novità")

  return data
})

// ─── Admin (SUPERADMIN only) ───

export const getAdminChangelogsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireSuperadmin()

    const { data, error } = await supabaseAdmin
      .from("changelogs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error("Errore nel caricamento dei changelog")

    return data
  },
)

export const getChangelogDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireSuperadmin()

    const { data, error } = await supabaseAdmin
      .from("changelogs")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw new Error("Changelog non trovato")

    return data
  })

export const createChangelogFn = createServerFn({ method: "POST" })
  .inputValidator(changelogSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()

    const { error } = await supabaseAdmin.from("changelogs").insert({
      version: data.version,
      title: data.title,
      body: data.body,
      category: data.category,
      is_draft: true,
      published_at: null,
    })

    if (error) throw new Error("Errore nella creazione del changelog")
  })

export const updateChangelogFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: string } & Record<string, unknown>) => input,
  )
  .handler(async ({ data: { id, ...fields } }) => {
    await requireSuperadmin()

    // Validate the update fields through the schema
    const parsed = updateChangelogSchema.parse(fields)

    const { error } = await supabaseAdmin
      .from("changelogs")
      .update(parsed)
      .eq("id", id)

    if (error) throw new Error("Errore nell'aggiornamento del changelog")
  })

export const deleteChangelogFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireSuperadmin()

    const { error } = await supabaseAdmin
      .from("changelogs")
      .delete()
      .eq("id", id)

    if (error) throw new Error("Errore nell'eliminazione del changelog")
  })

export const publishChangelogFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireSuperadmin()

    // Fetch current state to check if already published
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("changelogs")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existing) throw new Error("Changelog non trovato")

    const alreadyPublished = existing.published_at !== null

    // Set as published
    const { error } = await supabaseAdmin
      .from("changelogs")
      .update({ is_draft: false, published_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw new Error("Errore nella pubblicazione del changelog")

    // Broadcast notification only on first publish
    if (!alreadyPublished) {
      await broadcastToAllUsers(supabaseAdmin, {
        type: "ANNOUNCEMENT",
        title: `Novità v${existing.version}!`,
        body: existing.title,
        referenceId: existing.id,
        referenceType: "changelog",
        link: `/news#v${existing.version}`,
      })
    }
  })
