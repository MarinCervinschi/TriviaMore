import { foreignKey, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { profiles } from "../public/profiles"
import { courses } from "./courses"

export const courseMaintainers = catalogSchema
  .table(
    "course_maintainers",
    {
      userId: uuid("user_id").notNull(),
      courseId: uuid("course_id").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "course_maintainers_course_id_fkey",
      }).onDelete("cascade"),
      foreignKey({
        columns: [table.userId],
        foreignColumns: [profiles.id],
        name: "course_maintainers_user_id_fkey",
      }).onDelete("cascade"),
      primaryKey({
        columns: [table.userId, table.courseId],
        name: "course_maintainers_pkey",
      }),
    ],
  )
  .enableRLS()
