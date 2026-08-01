import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { profiles } from "./profiles"

export const userChangelogReads = pgTable(
  "user_changelog_reads",
  {
    userId: uuid("user_id").notNull(),
    version: text().notNull(),
    readAt: timestamp("read_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_user_changelog_reads_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_changelog_reads_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.version],
      name: "user_changelog_reads_pkey",
    }),
  ],
).enableRLS()
