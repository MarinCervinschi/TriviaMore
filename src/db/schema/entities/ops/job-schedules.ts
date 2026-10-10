import { boolean, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { opsSchema } from "../../common";

/** The schedules the console manages; an active one also has a row in pgboss.schedule under the same key. */
export const jobSchedules = opsSchema
	.table("job_schedules", {
		id: uuid().defaultRandom().primaryKey().notNull(),
		job: text().notNull(),
		cron: text().notNull(),
		timezone: text().default("Europe/Rome").notNull(),
		params: jsonb()
			.$type<Record<string, string | number | boolean | null>>()
			.default({})
			.notNull(),
		dryRun: boolean("dry_run").default(true).notNull(),
		paused: boolean().default(false).notNull(),
		createdBy: uuid("created_by"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	})
	.enableRLS();
