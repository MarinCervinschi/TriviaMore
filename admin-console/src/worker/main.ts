import { PgBoss } from "pg-boss";

import { log } from "@/lib/logging/server";
import { flush } from "@/lib/logging/shipper";

import { QUEUE_OPTIONS, type QueuedRun } from "~/lib/jobs/queue";
import { JOBS } from "~/lib/jobs/registry";
import { syncSchedules } from "~/lib/jobs/service/schedules";

import { abandonRuns } from "./abandon";
import { inFlight, runQueuedJob } from "./run";

const url = process.env.STAGING_DATABASE_URL;
if (!url) throw new Error("STAGING_DATABASE_URL non è configurata.");

// The pgboss schema comes from a migration applied by hand, so the worker never installs or upgrades it.
const boss = new PgBoss({ connectionString: url, migrate: false });
boss.on("error", error => log.error("Job queue error", {}, error));

await boss.start();
// One worker per staging database, so anything still running belongs to a worker that is gone.
await abandonRuns(
	boss,
	"all-running",
	"Interrotta: il worker si è fermato durante l'esecuzione."
);
for (const job of JOBS) {
	if (!(await boss.getQueue(job.name))) await boss.createQueue(job.name, QUEUE_OPTIONS);
	await boss.work<QueuedRun>(
		job.name,
		{ batchSize: 1, pollingIntervalSeconds: 5 },
		async ([queued]) => {
			if (queued) await runQueuedJob(job, queued);
		}
	);
}
const synced = await syncSchedules();
log.info("Worker started with {JobCount} jobs and {ScheduleCount} active schedules", {
	JobCount: JOBS.length,
	ScheduleCount: synced.activated,
	StraySchedules: synced.removed,
});

async function shutdown(signal: string) {
	log.info("Worker stopping on {Signal}", { Signal: signal });
	await boss.stop({ graceful: true, timeout: 30_000, close: false });
	await abandonRuns(boss, [...inFlight], "Interrotta allo spegnimento del worker.");
	await flush();
	process.exit(0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
