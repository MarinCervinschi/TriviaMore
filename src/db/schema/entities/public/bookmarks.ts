import { foreignKey, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"

import { questions } from "../catalog/questions"
import { profiles } from "./profiles"

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id").notNull(),
    questionId: uuid("question_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [questions.id],
      name: "bookmarks_question_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "bookmarks_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.questionId],
      name: "bookmarks_pkey",
    }),
  ],
).enableRLS()
