import {
	boolean,
	foreignKey,
	integer,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";
import { courses } from "./courses";

/** The curricula a cohort of a course can follow, as the catalogue publishes them. */
export const courseCurricula = catalogSchema
	.table(
		"course_curricula",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			courseId: uuid("course_id").notNull(),
			cohort: integer().notNull(),
			code: text().notNull(),
			name: text().notNull(),
			// The shared trunk, offered beside the curricula proper.
			common: boolean().default(false).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "course_curricula_course_id_fkey",
			}).onDelete("cascade"),
			unique("course_curricula_course_id_cohort_code_key").on(
				table.courseId,
				table.cohort,
				table.code
			),
		]
	)
	.enableRLS();
