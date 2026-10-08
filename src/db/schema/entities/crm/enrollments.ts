import { sql } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	jsonb,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { crmSchema } from "../../common";
import { courseCurricula } from "../catalog/course-curricula";
import { courses } from "../catalog/courses";
import { profiles } from "../public/profiles";

/** Many rows per user, with at most one `is_current` and at most one per course. */
export const enrollments = crmSchema
	.table(
		"enrollments",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			courseId: uuid("course_id").notNull(),
			/** The curriculum of the enrolment's cohort, from the official plan. */
			curriculumId: uuid("curriculum_id"),
			startYear: integer("start_year"),
			/** The grading rules and the committee's points, validated by `careerSettingsSchema`. */
			careerSettings: jsonb("career_settings")
				.$type<Record<string, number>>()
				.default({})
				.notNull(),
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
			foreignKey({
				columns: [table.curriculumId],
				foreignColumns: [courseCurricula.id],
				name: "enrollments_curriculum_id_fkey",
			}).onDelete("set null"),
		]
	)
	.enableRLS();
