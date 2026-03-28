import type { Tables } from "@/lib/supabase/database.types"

export type Notification = Tables<"notifications">

export type NotificationType = Notification["type"]

export type NotificationWithMeta = Notification & {
  time_ago: string
}
