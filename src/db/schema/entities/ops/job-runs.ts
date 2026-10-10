import { sql } from "drizzle-orm";
import { boolean, index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { opsSchema } from "../../common";
import { jobRunStatusEnum, jobRunTriggerEnum } from "../public/enums";

export type JobChangeValue = string | number | boolean | null;

export type JobChangeRow = {
	kind: "added" | "updated" | "removed";
	label: string;
	detail?: string;
	/** For an update, each field that changed; for an addition or a removal, the row's own values. */
	fields?: { name: string; before: JobChangeValue; after: JobChangeValue }[];
	/** The medal of an achievement the row awards, drawn beside it. */
	badge?: { icon: string; accent: string; shape: string; tier: number };
};

/** What a run changed, or would change, by what it touches; rows past a cap are only counted. */
export type JobChanges = {
	key: string;
	title: string;
	counts: { added: number; updated: number; removed: number };
	rows: JobChangeRow[];
	omitted: number;
}[];

export const jobRuns = opsSchema
	.table(
		"job_runs",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			job: text().notNull(),
			params: jsonb()
				.$type<Record<string, string | number | boolean | null>>()
				.default({})
				.notNull(),
			dryRun: boolean("dry_run").default(false).notNull(),
			status: jobRunStatusEnum().default("QUEUED").notNull(),
			trigger: jobRunTriggerEnum().default("MANUAL").notNull(),
			requestedBy: uuid("requested_by"),
			/** The pg-boss schedule key, for a run a schedule started. */
			scheduleKey: text("schedule_key"),
			queueJobId: uuid("queue_job_id"),
			summary: jsonb().$type<Record<string, number | string>>(),
			changes: jsonb().$type<JobChanges>(),
			error: text(),
			queuedAt: timestamp("queued_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
			finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
		},
		table => [
			index("idx_job_runs_job_queued_at").using(
				"btree",
				table.job,
				table.queuedAt.desc().nullsFirst()
			),
			index("idx_job_runs_active")
				.using("btree", table.status)
				.where(sql`status in ('QUEUED', 'RUNNING')`),
		]
	)
	.enableRLS();
