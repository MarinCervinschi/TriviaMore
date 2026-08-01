import { sql } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { notificationTypeEnum } from "./enums"
import { profiles } from "./profiles"

export const notifications = pgTable(
  "notifications",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    type: notificationTypeEnum().notNull(),
    title: text().notNull(),
    body: text(),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    link: text(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // No .op() here: drizzle-kit drops the DESC direction when an opclass is
    // also given, and timestamptz_ops is the default anyway.
    index("idx_notifications_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst(),
    ),
    index("idx_notifications_unread")
      .using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
      .where(sql`(is_read = false)`),
    index("idx_notifications_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "notifications_user_id_fkey",
    }).onDelete("cascade"),
  ],
).enableRLS()
