import { boolean, doublePrecision, index, integer, pgTable, smallint, text, timestamp, unique } from "drizzle-orm/pg-core"

import { achievementComparatorEnum, achievementMetricEnum } from "./enums"

export const achievements = pgTable(
  "achievements",
  {
    key: text().primaryKey().notNull(),
    family: text().notNull(),
    tier: smallint().default(1).notNull(),
    name: text().notNull(),
    description: text().notNull(),
    // The section the page groups this under, held as its Italian label so a
    // category added from the SQL console needs no TS map and no deploy.
    category: text().notNull(),
    metric: achievementMetricEnum().notNull(),
    comparator: achievementComparatorEnum().default("GTE").notNull(),
    threshold: doublePrecision().notNull(),
    icon: text().notNull(),
    // The silhouette, alongside icon and accent: a category added from the SQL
    // console picks its own without a deploy. Defaulted because the column is
    // added to a populated table, and because an unset one must still render.
    shape: text().notNull().default("seal"),
    accent: text().notNull(),
    position: integer().default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_achievements_position").using(
      "btree",
      table.position.asc().nullsLast().op("int4_ops"),
    ),
    unique("achievements_family_tier_key").on(table.family, table.tier),
  ],
).enableRLS()
