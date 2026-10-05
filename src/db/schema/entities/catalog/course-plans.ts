import {
	boolean,
	foreignKey,
	index,
	integer,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";
import { classes } from "./classes";
import { courseCurricula } from "./course-curricula";
import { courses } from "./courses";
import { evaluationTypeEnum } from "./enums";

/** The official study plan of a course for each cohort and curriculum, as the catalogue publishes it. */
export const coursePlans = catalogSchema
	.table(
		"course_plans",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			courseId: uuid("course_id").notNull(),
			// The academic year the plan starts in.
			cohort: integer().notNull(),
			curriculumId: uuid("curriculum_id").notNull(),
			code: text().notNull(),
			// Null when the class is not in our catalogue, as for one retired before the current plan.
			classId: uuid("class_id"),
			name: text().notNull(),
			cfu: integer(),
			classYear: integer("class_year").notNull(),
			mandatory: boolean().default(false).notNull(),
			evaluation: evaluationTypeEnum(),
			taf: text(),
			teachingPeriod: text("teaching_period"),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_course_plans_course_cohort").using(
				"btree",
				table.courseId.asc().nullsLast().op("uuid_ops"),
				table.cohort.asc().nullsLast().op("int4_ops")
			),
			index("idx_course_plans_class").using(
				"btree",
				table.classId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "course_plans_course_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.curriculumId],
				foreignColumns: [courseCurricula.id],
				name: "course_plans_curriculum_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.classId],
				foreignColumns: [classes.id],
				name: "course_plans_class_id_fkey",
			}).onDelete("set null"),
			unique("course_plans_curriculum_id_code_key").on(table.curriculumId, table.code),
		]
	)
	.enableRLS();
