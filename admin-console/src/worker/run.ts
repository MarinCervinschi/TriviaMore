import { and, eq } from "drizzle-orm";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Job } from "pg-boss";

import { jobRuns } from "@/db/schema";
import { createContext, runWithContext } from "@/lib/logging/context";
import { log } from "@/lib/logging/server";

import { consoleDb } from "~/lib/db/client";
import { IS_PRODUCTION } from "~/lib/environment";
import type { QueuedRun } from "~/lib/jobs/queue";
import type { JobDefinition } from "~/lib/jobs/types";

const now = () => new Date().toISOString();

/** How often a running job looks for a stop request from the console. */
const STOP_POLL_MS = 3000;

/** Aborts `controller` once the console asks to stop the run; the returned function ends the watch. */
function watchForStop(runId: string, controller: AbortController): () => void {
	const timer = setInterval(async () => {
		try {
			const [row] = await consoleDb()
				.select({ asked: jobRuns.cancelRequestedAt })
				.from(jobRuns)
				.where(eq(jobRuns.id, runId));
			if (row?.asked) controller.abort();
		} catch (error) {
			log.warn("Stop check failed for {RunId}: {Reason}", {
				RunId: runId,
				Reason: error instanceof Error ? error.message : String(error),
			});
		}
	}, STOP_POLL_MS);
	return () => clearInterval(timer);
}

/** The runs this process is executing, so a shutdown can close the ones it cuts short. */
export const inFlight = new Set<string>();

let previous: Promise<unknown> = Promise.resolve();

/** One job at a time in this process: the catalogue jobs share their tables and the source cache. */
function exclusive<T>(work: () => Promise<T>): Promise<T> {
	const next = previous.then(work, work);
	previous = next.catch(() => undefined);
	return next;
}

/** Runs one queued job and records the outcome on its row; a failure is recorded, not thrown, so pg-boss does not retry it. */
export function runQueuedJob(
	definition: JobDefinition,
	job: Job<QueuedRun>
): Promise<void> {
	return exclusive(() => execute(definition, job));
}

/** A scheduled job arrives without a row, so it gets one here, the way the console records a manual run. */
async function runIdOf(
	definition: JobDefinition,
	job: Job<QueuedRun>
): Promise<string> {
	if ("runId" in job.data) return job.data.runId;
	const { scheduleKey, params, dryRun } = job.data.schedule;
	// Nothing writes production on its own: a scheduled run there is always a simulation.
	const [created] = await consoleDb()
		.insert(jobRuns)
		.values({
			job: definition.name,
			params,
			dryRun: dryRun || IS_PRODUCTION,
			trigger: "SCHEDULE",
			scheduleKey,
			queueJobId: job.id,
		})
		.returning({ id: jobRuns.id });
	return created!.id;
}

async function execute(definition: JobDefinition, job: Job<QueuedRun>): Promise<void> {
	const db = consoleDb();
	const runId = await runIdOf(definition, job);
	// Claimed in one statement, so an edit from the console lands either before it or not at all.
	const [run] = await db
		.update(jobRuns)
		.set({ status: "RUNNING", startedAt: now() })
		.where(and(eq(jobRuns.id, runId), eq(jobRuns.status, "QUEUED")))
		.returning();
	if (!run) {
		log.warn("Job {Job} run {RunId} is no longer queued", {
			Job: definition.name,
			RunId: runId,
		});
		return;
	}

	inFlight.add(run.id);
	const context = createContext({ source: "job", path: definition.name });
	await runWithContext(context, async () => {
		const started = performance.now();
		log.info("Job {Job} started", {
			Job: definition.name,
			RunId: run.id,
			DryRun: run.dryRun,
		});

		const cacheDir = await mkdtemp(join(tmpdir(), "triviamore-job-"));
		const stop = new AbortController();
		const unwatch = watchForStop(run.id, stop);
		try {
			const params = definition.params.parse(run.params);
			const { summary, changes } = await definition.run(params, {
				db,
				dryRun: run.dryRun,
				signal: AbortSignal.any([job.signal, stop.signal]),
				cacheDir,
			});
			await db
				.update(jobRuns)
				.set({
					status: "SUCCEEDED",
					summary,
					changes: changes ?? null,
					finishedAt: now(),
				})
				.where(eq(jobRuns.id, run.id));
			log.info("Job {Job} succeeded in {Elapsed} ms", {
				Job: definition.name,
				RunId: run.id,
				Elapsed: Math.round(performance.now() - started),
				...summary,
			});
		} catch (error) {
			if (stop.signal.aborted) {
				await db
					.update(jobRuns)
					.set({
						status: "CANCELLED",
						error: "Fermata dalla console.",
						finishedAt: now(),
					})
					.where(eq(jobRuns.id, run.id));
				log.info("Job {Job} stopped from the console", {
					Job: definition.name,
					RunId: run.id,
				});
				return;
			}
			const message = error instanceof Error ? error.message : String(error);
			await db
				.update(jobRuns)
				.set({ status: "FAILED", error: message, finishedAt: now() })
				.where(eq(jobRuns.id, run.id));
			log.error(
				"Job {Job} failed in {Elapsed} ms",
				{
					Job: definition.name,
					RunId: run.id,
					Elapsed: Math.round(performance.now() - started),
				},
				error
			);
		} finally {
			unwatch();
			await rm(cacheDir, { recursive: true, force: true });
		}
	}).finally(() => inFlight.delete(run.id));
}
