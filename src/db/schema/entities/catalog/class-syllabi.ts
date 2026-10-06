import { foreignKey, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";
import { classes } from "./classes";

/** The official syllabus of a class, from the most recent offering that published one. */
export const classSyllabi = catalogSchema
	.table(
		"class_syllabi",
		{
			classId: uuid("class_id").primaryKey().notNull(),
			academicYear: integer("academic_year").notNull(),
			catalogueUrl: text("catalogue_url"),
			objectives: text(),
			contents: text(),
			prerequisites: text(),
			assessment: text(),
			readings: text(),
			teachingMethods: text("teaching_methods"),
			outcomes: text(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			foreignKey({
				columns: [table.classId],
				foreignColumns: [classes.id],
				name: "class_syllabi_class_id_fkey",
			}).onDelete("cascade"),
		]
	)
	.enableRLS();
