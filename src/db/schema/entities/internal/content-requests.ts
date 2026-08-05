import {
  foreignKey,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { internalSchema } from "../../common"
import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { departments } from "../catalog/departments"
import { sections } from "../catalog/sections"
import { contentRequestStatusEnum, contentRequestTypeEnum } from "../public/enums"
import { profiles } from "../public/profiles"

export const contentRequests = internalSchema.table(
  "content_requests",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    requestType: contentRequestTypeEnum("request_type").notNull(),
    status: contentRequestStatusEnum().default("PENDING").notNull(),
    submittedContent: jsonb("submitted_content").notNull(),
    targetDepartmentId: uuid("target_department_id"),
    targetCourseId: uuid("target_course_id"),
    targetClassId: uuid("target_class_id"),
    targetSectionId: uuid("target_section_id"),
    handledBy: uuid("handled_by"),
    handledAt: timestamp("handled_at", { withTimezone: true, mode: "string" }),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // No .op() here: drizzle-kit drops the DESC direction when an opclass is
    // also given, and timestamptz_ops is the default anyway.
    index("idx_content_requests_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst(),
    ),
    index("idx_content_requests_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    index("idx_content_requests_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.handledBy],
      foreignColumns: [profiles.id],
      name: "content_requests_handled_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.targetClassId],
      foreignColumns: [classes.id],
      name: "content_requests_target_class_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetCourseId],
      foreignColumns: [courses.id],
      name: "content_requests_target_course_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetDepartmentId],
      foreignColumns: [departments.id],
      name: "content_requests_target_department_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetSectionId],
      foreignColumns: [sections.id],
      name: "content_requests_target_section_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "content_requests_user_id_fkey",
    }).onDelete("cascade"),
  ],
).enableRLS()
