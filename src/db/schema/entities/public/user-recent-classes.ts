import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { profiles } from "./profiles"

export const userRecentClasses = pgTable(
  "user_recent_classes",
  {
    userId: uuid("user_id").notNull(),
    classId: uuid("class_id").notNull(),
    courseId: uuid("course_id").notNull(),
    lastVisited: timestamp("last_visited", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    visitCount: integer("visit_count").default(1).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.classId],
      foreignColumns: [classes.id],
      name: "user_recent_classes_class_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "user_recent_classes_course_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_recent_classes_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.classId],
      name: "user_recent_classes_pkey",
    }),
  ],
).enableRLS()
