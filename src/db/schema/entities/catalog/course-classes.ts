import {
	boolean,
	foreignKey,
	index,
	integer,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";
import { classes } from "./classes";
import { courses } from "./courses";
import { evaluationTypeEnum } from "./enums";

export const courseClasses = catalogSchema
	.table(
		"course_classes",
		{
			courseId: uuid("course_id").notNull(),
			classId: uuid("class_id").notNull(),
			code: text().notNull(),
			classYear: integer("class_year").notNull(),
			mandatory: boolean().default(false).notNull(),
			catalogueUrl: text("catalogue_url"),
			curriculum: text(),
			evaluation: evaluationTypeEnum(),
			taf: text(),
			teachingPeriod: text("teaching_period"),
			// Null until classified: the sync fills it only when null, so a correction sticks.
			isTeaching: boolean("is_teaching"),
			position: integer().default(0).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_course_classes_class").using(
				"btree",
				table.classId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.classId],
				foreignColumns: [classes.id],
				name: "course_classes_class_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.courseId],
				foreignColumns: [courses.id],
				name: "course_classes_course_id_fkey",
			}).onDelete("cascade"),
			primaryKey({
				columns: [table.courseId, table.classId],
				name: "course_classes_pkey",
			}),
			unique("course_classes_code_course_id_key").on(table.code, table.courseId),
		]
	)
	.enableRLS();
