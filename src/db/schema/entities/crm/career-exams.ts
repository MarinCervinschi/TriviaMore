import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	foreignKey,
	index,
	integer,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { crmSchema } from "../../common";
import { classes } from "../catalog/classes";
import { careerExamStatusEnum } from "../public/enums";
import { enrollments } from "./enrollments";

/** One line of a student's record; name and CFU are its own copy, so a catalogue sync never rewrites it. */
export const careerExams = crmSchema
	.table(
		"career_exams",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			enrollmentId: uuid("enrollment_id").notNull(),
			classId: uuid("class_id"),
			/** The activity code in the plan it was prefilled from; null for a free entry. */
			planCode: text("plan_code"),
			/** The plan's choice group it fills; null for a mandatory exam or a free entry. */
			groupCode: text("group_code"),
			name: text().notNull(),
			cfu: integer().notNull(),
			classYear: integer("class_year"),
			graded: boolean().default(true).notNull(),
			status: careerExamStatusEnum().default("PLANNED").notNull(),
			grade: integer(),
			honours: boolean().default(false).notNull(),
			examDate: date("exam_date", { mode: "string" }),
			position: integer().default(0).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_career_exams_enrollment").using("btree", table.enrollmentId),
			foreignKey({
				columns: [table.enrollmentId],
				foreignColumns: [enrollments.id],
				name: "career_exams_enrollment_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.classId],
				foreignColumns: [classes.id],
				name: "career_exams_class_id_fkey",
			}).onDelete("set null"),
			check("career_exams_cfu_check", sql`cfu > 0`),
			check(
				"career_exams_grade_check",
				sql`grade IS NULL OR (grade BETWEEN 18 AND 30)`
			),
			check("career_exams_honours_check", sql`NOT honours OR grade = 30`),
		]
	)
	.enableRLS();
