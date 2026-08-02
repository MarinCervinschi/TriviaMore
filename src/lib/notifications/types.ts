import type { notifications } from "@/db/schema"

export type Notification = typeof notifications.$inferSelect

export type NotificationType = Notification["type"]
