import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	foreignKey,
	index,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { crmSchema } from "../../common";
import { careerExams } from "./career-exams";

/** One appello of an exam in the record, on a day the student entered. */
export const examSittings = crmSchema
	.table(
		"exam_sittings",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			careerExamId: uuid("career_exam_id").notNull(),
			date: date({ mode: "string" }).notNull(),
			/** "scritto", "orale", or whatever the student calls it. */
			label: text(),
			chosen: boolean().default(false).notNull(),
			/** 1 to 3; drives the colour intensity on the calendar. */
			importance: smallint().default(2).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_exam_sittings_exam_date").using(
				"btree",
				table.careerExamId,
				table.date
			),
			uniqueIndex("exam_sittings_one_chosen")
				.on(table.careerExamId)
				.where(sql`chosen`),
			foreignKey({
				columns: [table.careerExamId],
				foreignColumns: [careerExams.id],
				name: "exam_sittings_career_exam_id_fkey",
			}).onDelete("cascade"),
			check("exam_sittings_importance_check", sql`importance BETWEEN 1 AND 3`),
			check("exam_sittings_label_check", sql`label IS NULL OR length(label) <= 40`),
		]
	)
	.enableRLS();
