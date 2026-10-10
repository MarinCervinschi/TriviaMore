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
