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
