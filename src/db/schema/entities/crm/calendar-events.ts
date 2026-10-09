import { sql } from "drizzle-orm";
import {
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

/** A personal entry on the calendar: an event when it has a time, a note when it has none. */
export const calendarEvents = crmSchema
	.table(
		"calendar_events",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			date: date({ mode: "string" }).notNull(),
			/** Inclusive; set only when the event spans more than one day. */
			endDate: date("end_date", { mode: "string" }),
			startTime: time("start_time"),
			endTime: time("end_time"),
			title: text().notNull(),
			notes: text(),
			/** An RFC 5545 rule ("FREQ=WEEKLY;BYDAY=MO"), without the "RRULE:" prefix. */
			recurrence: text(),
			/** A `--chart-*` slot the user picked; null keeps the kind's own colour. */
			color: text(),
			/** The exam it is about, when it is about one; the event outlives the exam. */
			careerExamId: uuid("career_exam_id"),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_calendar_events_user_date").using("btree", table.userId, table.date),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "calendar_events_user_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.careerExamId],
				foreignColumns: [careerExams.id],
				name: "calendar_events_career_exam_id_fkey",
			}).onDelete("set null"),
			check(
				"calendar_events_color_check",
				sql`color IS NULL OR color IN ('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5')`
			),
			check("calendar_events_title_check", sql`length(title) BETWEEN 1 AND 120`),
			check("calendar_events_notes_check", sql`notes IS NULL OR length(notes) <= 2000`),
			check("calendar_events_end_date_check", sql`end_date IS NULL OR end_date > date`),
			check(
				"calendar_events_recurrence_check",
				sql`recurrence IS NULL OR length(recurrence) <= 200`
			),
			check(
				"calendar_events_time_check",
				sql`end_time IS NULL OR (start_time IS NOT NULL AND (end_date IS NOT NULL OR end_time > start_time))`
			),
		]
	)
	.enableRLS();
