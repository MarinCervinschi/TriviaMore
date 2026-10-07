import type { z } from "zod";

import type { jobRuns } from "@/db/schema";

import type { ConsoleDb } from "~/lib/db/client";

/** What a run reports when it ends: counts and short values the console shows as they are. */
export type JobSummary = Record<string, number | string>;

export type JobContext = {
	/** Staging, the only database a job writes to. */
	db: ConsoleDb;
	dryRun: boolean;
	signal: AbortSignal;
	/** An empty directory for this run only, removed when it ends. */
	cacheDir: string;
};

/** How the start form shows one parameter; an empty value means the job's default. */
export type JobField = {
	key: string;
	label: string;
	description: string;
	options: { value: string; label: string }[];
	/** The flag the terminal command takes for this parameter. */
	flag: string;
};

export type JobDefinition<TParams extends z.ZodType = z.ZodType> = {
	name: string;
	label: string;
	description: string;
	/** The terminal command that does the same, without `--apply`. */
	command: string;
	params: TParams;
	fields: JobField[];
	run: (params: z.infer<TParams>, context: JobContext) => Promise<JobSummary>;
};

export type JobRunStatus = JobRun["status"];

export type JobInfo = Pick<
	JobDefinition,
	"name" | "label" | "description" | "command" | "fields"
>;

export type JobRun = typeof jobRuns.$inferSelect;

export type JobParams = JobRun["params"];

export type StartJobResult =
	| { success: true; runId: string }
	| { success: false; error: string };

export type RunChangeResult = { success: true } | { success: false; error: string };

export type WorkerStatus = {
	online: boolean;
	lastSeen: string | null;
	host: string | null;
	memoryMb: number | null;
};

export type JobSchedule = {
	key: string;
	job: string;
	cron: string;
	description: string;
	params: JobParams;
	dryRun: boolean;
	paused: boolean;
	nextRun: string | null;
	lastRun: Pick<JobRun, "id" | "status" | "queuedAt"> | null;
};

export type SaveScheduleResult =
	| { success: true; key: string }
	| { success: false; error: string };

export type CronPreview =
	| { valid: true; next: string[] }
	| { valid: false; error: string };

export type TimelineWindow = "day" | "week";

export type TimelineRow = {
	schedule: JobSchedule;
	past: Pick<JobRun, "id" | "status" | "queuedAt">[];
	/** The occurrences still to come inside the window, at most a few hundred. */
	upcoming: string[];
	/** True when the window holds more occurrences than `upcoming` lists. */
	truncated: boolean;
};

export type SchedulerOverview = {
	/** The server's clock, so every position on the timeline is computed from the same instant. */
	now: string;
	start: string;
	end: string;
	counts: { schedules: number; paused: number; running: number; failedLastDay: number };
	next: { job: string; at: string } | null;
	rows: TimelineRow[];
};
