import { sql } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { crmSchema } from "../../common";
import { courses } from "../catalog/courses";
import { profiles } from "../public/profiles";

/**
 * The student's declared degree programme — the root the whole CRM hangs off.
 * Not `user_classes`, which records saved classes: derived, deletable, and free
 * to span several courses.
 *
 * Many rows per user, at most one `is_current` and at most one per course, so a
 * bachelor → master move keeps the old career and switching back promotes the
 * row the exams already hang off. `restrict` on the course: deleting one that
 * students are enrolled in must fail loudly, not cascade a career away.
 */
export const enrollments = crmSchema
	.table(
		"enrollments",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			courseId: uuid("course_id").notNull(),
			curriculum: text(),
			startYear: integer("start_year"),
			isCurrent: boolean("is_current").default(true).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_enrollments_user").using(
				"btree",
				table.userId.asc().nullsLast().op("uuid_ops")
			),
			uniqueIndex("enrollments_user_id_course_id_key").on(table.userId, table.courseId),
			uniqueIndex("enrollments_user_id_current_key")
				.using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
				.where(sql`is_current`),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "enrollments_user_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "enrollments_course_id_fkey",
			}).onDelete("restrict"),
		]
	)
	.enableRLS();
