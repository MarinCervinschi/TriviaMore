import { and, count, desc, eq, inArray } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { notifications } from "@/db/schema"

export async function insertNotifications(
  db: DbOrTx,
  rows: (typeof notifications.$inferInsert)[],
) {
  if (rows.length === 0) return
  await db.insert(notifications).values(rows)
}

export async function findNotifications(
  db: DbOrTx,
  userId: string,
  limit: number,
) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
}

export async function countUnread(db: DbOrTx, userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
  return row?.value ?? 0
}

export async function markRead(db: DbOrTx, userId: string, ids: string[]) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), inArray(notifications.id, ids)),
    )
}

export async function markAllRead(db: DbOrTx, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
}

export async function deleteNotification(
  db: DbOrTx,
  userId: string,
  id: string,
) {
  await db
    .delete(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.id, id)))
}
