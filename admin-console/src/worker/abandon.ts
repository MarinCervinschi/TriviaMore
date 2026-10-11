import { and, eq, inArray } from "drizzle-orm";
import type { PgBoss } from "pg-boss";

import { jobRuns } from "@/db/schema";
import { log } from "@/lib/logging/server";

import { consoleDb } from "~/lib/db/client";

/** Closes runs a stopped worker left open: the row fails and its pg-boss job is cancelled, or the singleton queue stays blocked. */
export async function abandonRuns(
	boss: PgBoss,
	runIds: string[] | "all-running",
	reason: string
) {
	const db = consoleDb();
	const running = eq(jobRuns.status, "RUNNING");
	const abandoned = await db
		.update(jobRuns)
		.set({ status: "FAILED", error: reason, finishedAt: new Date().toISOString() })
		.where(
			runIds === "all-running" ? running : and(running, inArray(jobRuns.id, runIds))
		)
		.returning({ id: jobRuns.id, job: jobRuns.job, queueJobId: jobRuns.queueJobId });

	for (const run of abandoned) {
		if (run.queueJobId) await boss.cancel(run.job, run.queueJobId);
		log.warn("Job {Job} run {RunId} abandoned", {
			Job: run.job,
			RunId: run.id,
			Reason: reason,
		});
	}
	return abandoned.length;
}

/** Closes queued runs whose pg-boss job will never be delivered again: a stopped worker held it, or it already ended. */
export async function abandonQueued(boss: PgBoss, reason: string) {
	const db = consoleDb();
	const queued = await db
		.select({ id: jobRuns.id, job: jobRuns.job, queueJobId: jobRuns.queueJobId })
		.from(jobRuns)
		.where(eq(jobRuns.status, "QUEUED"));

	let closed = 0;
	for (const run of queued) {
		// Without a queue id the console is still between recording the run and queueing it.
		if (!run.queueJobId) continue;
		const job = await boss.getJobById(run.job, run.queueJobId);
		if (job && (job.state === "created" || job.state === "retry")) continue;
		const [updated] = await db
			.update(jobRuns)
			.set({ status: "FAILED", error: reason, finishedAt: new Date().toISOString() })
			.where(and(eq(jobRuns.id, run.id), eq(jobRuns.status, "QUEUED")))
			.returning({ id: jobRuns.id });
		if (!updated) continue;
		if (job?.state === "active") await boss.cancel(run.job, job.id);
		closed++;
		log.warn("Job {Job} run {RunId} abandoned in the queue", {
			Job: run.job,
			RunId: run.id,
			Reason: reason,
		});
	}
	return closed;
}
