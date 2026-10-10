import { sql } from "drizzle-orm";
import { check, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { opsSchema } from "../../common";

/** The owner's name and description for a job, over the ones in its code; a null keeps the code's. */
export const jobTexts = opsSchema
	.table(
		"job_texts",
		{
			job: text().primaryKey().notNull(),
			label: text(),
			description: text(),
			updatedBy: uuid("updated_by"),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		() => [
			check(
				"job_texts_label_check",
				sql`label IS NULL OR length(label) BETWEEN 1 AND 80`
			),
			check(
				"job_texts_description_check",
				sql`description IS NULL OR length(description) BETWEEN 1 AND 400`
			),
		]
	)
	.enableRLS();
