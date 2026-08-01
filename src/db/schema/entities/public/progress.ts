import {
  doublePrecision,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { sections } from "../catalog/sections"
import { quizModeEnum } from "../quiz/enums"
import { profiles } from "./profiles"

export const progress = pgTable(
  "progress",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    sectionId: uuid("section_id").notNull(),
    quizMode: quizModeEnum("quiz_mode").notNull(),
    quizzesTaken: integer("quizzes_taken").default(0).notNull(),
    averageScore: doublePrecision("average_score"),
    bestScore: doublePrecision("best_score"),
    totalTimeSpent: integer("total_time_spent").default(0).notNull(),
    improvementRate: doublePrecision("improvement_rate"),
    consistencyScore: doublePrecision("consistency_score"),
    lastAccessedAt: timestamp("last_accessed_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    firstAccessedAt: timestamp("first_accessed_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sectionId],
      foreignColumns: [sections.id],
      name: "progress_section_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "progress_user_id_fkey",
    }).onDelete("cascade"),
    unique("progress_user_id_section_id_quiz_mode_key").on(
      table.userId,
      table.sectionId,
      table.quizMode,
    ),
  ],
).enableRLS()
