import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { jobRuns } from "@/db/schema";

import { consoleDb } from "~/lib/db/client";

import { queueSender } from "../queue";
import { jobByName } from "../registry";
import type {
	JobParams,
	JobRun,
	JobRunDetail,
	RunChangeResult,
	StartJobResult,
	WorkerStatus,
} from "../types";

const ALREADY_STARTED = "L'esecuzione è già partita: non si può più cambiare.";

const RECENT_RUNS = 200;

const { changes: _report, ...RUN_COLUMNS } = getTableColumns(jobRuns);

export async function listRuns(): Promise<JobRun[]> {
	return consoleDb()
		.select(RUN_COLUMNS)
		.from(jobRuns)
		.orderBy(desc(jobRuns.queuedAt))
		.limit(RECENT_RUNS);
}

export async function getRun(id: string): Promise<JobRunDetail | null> {
	const [run] = await consoleDb().select().from(jobRuns).where(eq(jobRuns.id, id));
	return run ?? null;
}

/** Records the run, then queues it; the worker picks it up and writes the outcome on the same row. */
export async function startJob(
	input: { job: string; params: JobParams; dryRun: boolean },
	requestedBy: string
): Promise<StartJobResult> {
	const job = jobByName(input.job);
	if (!job) return { success: false, error: "Job sconosciuto." };
	const params = job.params.safeParse(input.params);
	if (!params.success) return { success: false, error: "Parametri non validi." };

	const db = consoleDb();
	const [run] = await db
		.insert(jobRuns)
		.values({
			job: job.name,
			params: params.data as JobParams,
			dryRun: input.dryRun && job.simulates !== false,
			requestedBy,
		})
		.returning({ id: jobRuns.id });

	const boss = await queueSender();
	const queueJobId = await boss.send(job.name, { runId: run!.id });
	if (!queueJobId) {
		await db
			.update(jobRuns)
			.set({
				status: "CANCELLED",
				error: "Un'esecuzione di questo job è già in coda.",
				finishedAt: new Date().toISOString(),
			})
			.where(eq(jobRuns.id, run!.id));
		return { success: false, error: "Un'esecuzione di questo job è già in coda." };
	}
	await db.update(jobRuns).set({ queueJobId }).where(eq(jobRuns.id, run!.id));
	return { success: true, runId: run!.id };
}

/** Changes the parameters or the mode of a run that is still queued; the worker reads them when it claims the run. */
export async function updateQueuedRun(input: {
	id: string;
	params: JobParams;
	dryRun: boolean;
}): Promise<RunChangeResult> {
	const run = await getRun(input.id);
	const job = run && jobByName(run.job);
	if (!job) return { success: false, error: "Esecuzione non trovata." };
	const params = job.params.safeParse(input.params);
	if (!params.success) return { success: false, error: "Parametri non validi." };

	const updated = await consoleDb()
		.update(jobRuns)
		.set({
			params: params.data as JobParams,
			dryRun: input.dryRun && job.simulates !== false,
		})
		.where(and(eq(jobRuns.id, input.id), eq(jobRuns.status, "QUEUED")))
		.returning({ id: jobRuns.id });
	return updated.length > 0
		? { success: true }
		: { success: false, error: ALREADY_STARTED };
}

/** Takes a run out of the queue before it starts: nothing ran, so its row goes too. */
export async function removeQueuedRun(id: string): Promise<RunChangeResult> {
	const [removed] = await consoleDb()
		.delete(jobRuns)
		.where(and(eq(jobRuns.id, id), eq(jobRuns.status, "QUEUED")))
		.returning({ job: jobRuns.job, queueJobId: jobRuns.queueJobId });
	if (!removed) {
		const run = await getRun(id);
		return { success: false, error: run ? ALREADY_STARTED : "Esecuzione non trovata." };
	}
	if (removed.queueJobId) {
		const boss = await queueSender();
		await boss.deleteJob(removed.job, removed.queueJobId);
	}
	return { success: true };
}

/** On when a pg-boss instance serving at least one queue sent its heartbeat within two intervals; the console's own instances serve none. */
export async function getWorkerStatus(): Promise<WorkerStatus> {
	const { rows } = await consoleDb().execute<{
		host: string;
		heartbeat_on: string;
		online: boolean;
		rss: number | null;
	}>(sql`
		select host, heartbeat_on, (metrics ->> 'rss')::bigint as rss,
			stopped_on is null and heartbeat_on > now() - make_interval(secs => heartbeat_seconds * 2) as online
		from pgboss.instance
		where jsonb_array_length(workers) > 0
		order by heartbeat_on desc
		limit 1
	`);
	const [latest] = rows;
	if (!latest) return { online: false, lastSeen: null, host: null, memoryMb: null };
	return {
		online: latest.online,
		lastSeen: new Date(latest.heartbeat_on).toISOString(),
		host: latest.host,
		memoryMb: latest.rss === null ? null : Math.round(Number(latest.rss) / 1e6),
	};
}
