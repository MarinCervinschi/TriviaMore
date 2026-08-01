import { foreignKey, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"

import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { profiles } from "./profiles"

export const userClasses = pgTable(
  "user_classes",
  {
    userId: uuid("user_id").notNull(),
    classId: uuid("class_id").notNull(),
    courseId: uuid("course_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.classId],
      foreignColumns: [classes.id],
      name: "user_classes_class_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "user_classes_course_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_classes_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.classId],
      name: "user_classes_pkey",
    }),
  ],
).enableRLS()
