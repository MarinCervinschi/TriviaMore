import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	foreignKey,
	index,
	text,
	time,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { crmSchema } from "../../common";
import { profiles } from "../public/profiles";
import { careerExams } from "./career-exams";

/** A to-do on a day of the calendar, ticked off when done. */
export const tasks = crmSchema
	.table(
		"tasks",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			title: text().notNull(),
			notes: text(),
			dueDate: date("due_date", { mode: "string" }).notNull(),
			dueTime: time("due_time"),
			/** Where the block ends on the calendar; without it a timed task takes an hour. */
			endTime: time("end_time"),
			done: boolean().default(false).notNull(),
			/** A `--chart-*` slot the user picked; null keeps the kind's own colour. */
			color: text(),
			doneAt: timestamp("done_at", { withTimezone: true, mode: "string" }),
			/** The exam it is for, when it is for one; the task outlives the exam. */
			careerExamId: uuid("career_exam_id"),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_tasks_user_due").using("btree", table.userId, table.dueDate),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "tasks_user_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.careerExamId],
				foreignColumns: [careerExams.id],
				name: "tasks_career_exam_id_fkey",
			}).onDelete("set null"),
			check(
				"tasks_color_check",
				sql`color IS NULL OR color IN ('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5')`
			),
			check("tasks_title_check", sql`length(title) BETWEEN 1 AND 200`),
			check("tasks_notes_check", sql`notes IS NULL OR length(notes) <= 2000`),
			check(
				"tasks_end_time_check",
				sql`end_time IS NULL OR (due_time IS NOT NULL AND end_time > due_time)`
			),
			check("tasks_done_at_check", sql`done OR done_at IS NULL`),
		]
	)
	.enableRLS();
