import type { z } from "zod";

import type { JobChanges, jobRuns } from "@/db/schema";

import type { ConsoleDb } from "~/lib/db/client";

/** What a run reports when it ends: counts and short values the console shows as they are. */
export type JobSummary = Record<string, number | string>;

/** The counts a run reports, and, when the job can say, the rows it changed or would change. */
export type JobResult = { summary: JobSummary; changes?: JobChanges };

export type JobContext = {
	/** The console's database: the local one in development, production once deployed. */
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
	/** A yes or no: the command takes the bare flag when the value is set. */
	toggle?: boolean;
};

export type JobDefinition<TParams extends z.ZodType = z.ZodType> = {
	name: string;
	label: string;
	description: string;
	/** The group the catalogue lists it under. */
	area: string;
	/** `false` for a job with nothing worth simulating: it only runs, and production never schedules it. */
	simulates?: boolean;
	/** The terminal command that does the same, as a simulation unless `terminal` says otherwise. */
	command: string;
	/** For scripts that write by default: the flags that make the command simulate or apply. */
	terminal?: { dryRun: string; apply: string };
	params: TParams;
	fields: JobField[];
	run: (params: z.infer<TParams>, context: JobContext) => Promise<JobResult>;
};

export type JobRunStatus = JobRun["status"];

export type JobInfo = Pick<
	JobDefinition,
	| "name"
	| "label"
	| "description"
	| "area"
	| "simulates"
	| "command"
	| "terminal"
	| "fields"
>;

/** A run as lists show it; the change report is read only by the run's own page. */
export type JobRun = Omit<JobRunDetail, "changes">;

export type JobRunDetail = typeof jobRuns.$inferSelect;

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
