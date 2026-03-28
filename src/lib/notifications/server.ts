import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import type { Notification } from "./types"

// Helper: get authenticated user or throw
async function getAuthUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Non autenticato")
  return { supabase, user }
}

export const getNotificationsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Notification[]> => {
    const { supabase, user } = await getAuthUser()

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw new Error("Errore nel caricamento delle notifiche")

    return data ?? []
  },
)

export const getUnreadCountFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<number> => {
    const { supabase, user } = await getAuthUser()

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) throw new Error("Errore nel conteggio delle notifiche")

    return count ?? 0
  },
)

export const markReadFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", data.id)
      .eq("user_id", user.id)

    if (error) throw new Error("Errore nell'aggiornamento della notifica")
  })

export const markAllReadFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const { supabase, user } = await getAuthUser()

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) throw new Error("Errore nell'aggiornamento delle notifiche")
  },
)

export const deleteNotificationFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", data.id)
      .eq("user_id", user.id)

    if (error) throw new Error("Errore nell'eliminazione della notifica")
  })
