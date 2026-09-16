import { sql } from "drizzle-orm"
import {
  doublePrecision,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { achievements } from "./achievements"
import { profiles } from "./profiles"

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id").notNull(),
    achievementKey: text("achievement_key").notNull(),
    awardedAt: timestamp("awarded_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    // The metric as it stood at the unlock. Keeps the award readable after its
    // threshold is retuned, which is the whole point of editable rules.
    metricValue: doublePrecision("metric_value"),
    pinPosition: smallint("pin_position"),
  },
  (table) => [
    index("idx_user_achievements_pinned")
      .using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
      .where(sql`(pin_position IS NOT NULL)`),
    foreignKey({
      columns: [table.achievementKey],
      foreignColumns: [achievements.key],
      name: "user_achievements_achievement_key_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_achievements_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.achievementKey],
      name: "user_achievements_pkey",
    }),
  ],
).enableRLS()
