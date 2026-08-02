import { getDb } from "@/db"
import type { DbOrTx } from "@/db"

import {
  findNotificationRecipients,
  findNotificationScope,
} from "./db/recipients"
import type { NotificationTarget } from "./db/recipients"
import {
  countUnread,
  deleteNotification,
  findNotifications,
  insertNotifications,
  markAllRead,
  markRead,
} from "./db/notifications"
import type { Notification, NotificationType } from "./types"

const FEED_LIMIT = 50

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  return findNotifications(getDb(), userId, FEED_LIMIT)
}

export async function getUnreadCount(userId: string): Promise<number> {
  return countUnread(getDb(), userId)
}

export async function markNotificationRead(userId: string, id: string) {
  await markRead(getDb(), userId, [id])
}

export async function markAllNotificationsRead(userId: string) {
  await markAllRead(getDb(), userId)
}

export async function removeNotification(userId: string, id: string) {
  await deleteNotification(getDb(), userId, id)
}

export async function createNotification(
  db: DbOrTx,
  params: {
    userId: string
    type: NotificationType
    title: string
    body?: string
    referenceId?: string
    referenceType?: string
    link?: string
  },
) {
  await insertNotifications(db, [
    {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      referenceId: params.referenceId ?? null,
      referenceType: params.referenceType ?? null,
      link: params.link ?? null,
    },
  ])
}

// Notifies everyone with authority over a content request's target: superadmins,
// the maintainers of the owning course and the admins of the owning department.
export async function notifyAdminsInScope(
  db: DbOrTx,
  request: NotificationTarget & { id: string; title: string },
  overrides?: { notificationTitle?: string; notificationType?: NotificationType },
) {
  const scope = await findNotificationScope(db, request)
  const recipients = await findNotificationRecipients(db, scope)

  await insertNotifications(
    db,
    recipients.map((userId) => ({
      userId,
      type: overrides?.notificationType ?? ("NEW_REQUEST_RECEIVED" as const),
      title: overrides?.notificationTitle ?? "Nuova richiesta di contenuto",
      body: request.title,
      referenceId: request.id,
      referenceType: "content_request",
      link: `/admin/requests/${request.id}`,
    })),
  )
}
