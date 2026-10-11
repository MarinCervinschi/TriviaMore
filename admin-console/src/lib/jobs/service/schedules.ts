import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { jobRuns, jobSchedules } from "@/db/schema";

import { consoleDb } from "~/lib/db/client";
import { IS_PRODUCTION } from "~/lib/environment";

import { SCHEDULE_TIMEZONE, describeCron } from "../cron";
import { type ScheduledRun, queueSender } from "../queue";
import { jobByName } from "../registry";
import type {
	CronPreview,
	JobParams,
	JobSchedule,
	RunChangeResult,
	SaveScheduleResult,
	SchedulerOverview,
	TimelineRow,
	TimelineWindow,
} from "../types";

const PREVIEW_COUNT = 3;
const UPCOMING_CAP = 300;
const HOUR_MS = 60 * 60 * 1000;

/** How far the timeline reaches behind and ahead of now: mostly ahead, since that is what a schedule decides. */
const WINDOWS: Record<TimelineWindow, { pastMs: number; futureMs: number }> = {
	day: { pastMs: 6 * HOUR_MS, futureMs: 18 * HOUR_MS },
	week: { pastMs: 24 * HOUR_MS, futureMs: 6 * 24 * HOUR_MS },
};

type ScheduleRow = typeof jobSchedules.$inferSelect;

/** The jobs a schedule queued that no worker has claimed yet: they carry its old settings, so they go with it. */
async function dropPendingRuns(job: string, key: string): Promise<void> {
	const { rows } = await consoleDb().execute<{ id: string }>(sql`
		select id from pgboss.job
		where name = ${job} and state in ('created', 'retry') and data -> 'schedule' ->> 'scheduleKey' = ${key}
	`);
	if (rows.length === 0) return;
	const boss = await queueSender();
	await boss.deleteJob(
		job,
		rows.map(row => row.id)
	);
}

async function activate(row: ScheduleRow): Promise<void> {
	const boss = await queueSender();
	const schedule: ScheduledRun = {
		scheduleKey: row.id,
		params: row.params,
		dryRun: row.dryRun,
	};
	await boss.schedule(
		row.job,
		row.cron,
		{ schedule },
		{ tz: row.timezone, key: row.id, missed: "once" }
	);
}

async function deactivate(row: Pick<ScheduleRow, "id" | "job">): Promise<void> {
	const boss = await queueSender();
	await boss.unschedule(row.job, row.id);
	await dropPendingRuns(row.job, row.id);
}

/** Makes pg-boss hold exactly the active schedules of the table; the worker runs it when it starts. */
export async function syncSchedules(): Promise<{ activated: number; removed: number }> {
	const boss = await queueSender();
	const rows = await consoleDb().select().from(jobSchedules);
	const active = rows.filter(row => !row.paused);
	for (const row of active) await activate(row);

	const keep = new Set(active.map(row => row.id));
	const stray = (await boss.getSchedules()).filter(schedule => !keep.has(schedule.key));
	for (const schedule of stray) await boss.unschedule(schedule.name, schedule.key);
	return { activated: active.length, removed: stray.length };
}

function nextOccurrence(
	boss: Awaited<ReturnType<typeof queueSender>>,
	row: ScheduleRow
): string | null {
	if (row.paused) return null;
	const [next] = boss.previewSchedule(row.cron, { tz: row.timezone, count: 1 });
	return next ? next.toISOString() : null;
}

async function lastRuns(keys: string[]) {
	if (keys.length === 0) return new Map<string, JobSchedule["lastRun"]>();
	const runs = await consoleDb()
		.selectDistinctOn([jobRuns.scheduleKey], {
			key: jobRuns.scheduleKey,
			id: jobRuns.id,
			status: jobRuns.status,
			queuedAt: jobRuns.queuedAt,
		})
		.from(jobRuns)
		.where(inArray(jobRuns.scheduleKey, keys))
		.orderBy(jobRuns.scheduleKey, desc(jobRuns.queuedAt));
	return new Map(runs.map(({ key, ...run }) => [key!, run]));
}

export async function listSchedules(): Promise<JobSchedule[]> {
	const boss = await queueSender();
	const rows = await consoleDb()
		.select()
		.from(jobSchedules)
		.orderBy(asc(jobSchedules.createdAt));
	const last = await lastRuns(rows.map(row => row.id));
	return rows.map(row => ({
		key: row.id,
		job: row.job,
		cron: row.cron,
		description: describeCron(row.cron),
		params: row.params,
		dryRun: row.dryRun,
		paused: row.paused,
		nextRun: nextOccurrence(boss, row),
		lastRun: last.get(row.id) ?? null,
	}));
}

/** The next occurrences of an expression, in the console's time zone, or why it is not valid. */
export async function previewCron(cron: string): Promise<CronPreview> {
	const boss = await queueSender();
	try {
		const next = boss.previewSchedule(cron, {
			tz: SCHEDULE_TIMEZONE,
			count: PREVIEW_COUNT,
		});
		return { valid: true, next: next.map(date => date.toISOString()) };
	} catch {
		return { valid: false, error: "Espressione cron non valida." };
	}
}

/** Creates a schedule, or with `key` replaces one; the job of an existing schedule cannot change. */
export async function saveSchedule(
	input: {
		key?: string;
		job: string;
		cron: string;
		params: JobParams;
		dryRun: boolean;
	},
	createdBy: string
): Promise<SaveScheduleResult> {
	const job = jobByName(input.job);
	if (!job) return { success: false, error: "Job sconosciuto." };
	if (IS_PRODUCTION && job.simulates === false) {
		return { success: false, error: "In produzione questo job si avvia solo a mano." };
	}
	const params = job.params.safeParse(input.params);
	if (!params.success) return { success: false, error: "Parametri non validi." };
	const cron = input.cron.trim();
	const preview = await previewCron(cron);
	if (!preview.valid) return { success: false, error: preview.error };

	const db = consoleDb();
	const values = { cron, params: params.data as JobParams, dryRun: input.dryRun };
	let row: ScheduleRow | undefined;
	if (input.key) {
		const [existing] = await db
			.select()
			.from(jobSchedules)
			.where(eq(jobSchedules.id, input.key));
		if (!existing) return { success: false, error: "Pianificazione non trovata." };
		if (existing.job !== job.name) {
			return { success: false, error: "Il job di una pianificazione non si cambia." };
		}
		[row] = await db
			.update(jobSchedules)
			.set(values)
			.where(eq(jobSchedules.id, input.key))
			.returning();
		if (!row!.paused) await dropPendingRuns(row!.job, row!.id);
	} else {
		[row] = await db
			.insert(jobSchedules)
			.values({ ...values, job: job.name, timezone: SCHEDULE_TIMEZONE, createdBy })
			.returning();
	}
	if (!row!.paused) await activate(row!);
	return { success: true, key: row!.id };
}

export async function deleteSchedule(key: string): Promise<RunChangeResult> {
	const [row] = await consoleDb()
		.delete(jobSchedules)
		.where(eq(jobSchedules.id, key))
		.returning({ id: jobSchedules.id, job: jobSchedules.job });
	if (!row) return { success: false, error: "Pianificazione non trovata." };
	await deactivate(row);
	return { success: true };
}

/** Pausing takes the schedule out of pg-boss and drops what it already queued; resuming puts it back. */
export async function setSchedulePaused(
	key: string | "all",
	paused: boolean
): Promise<RunChangeResult> {
	const rows = await consoleDb()
		.update(jobSchedules)
		.set({ paused })
		.where(key === "all" ? eq(jobSchedules.paused, !paused) : eq(jobSchedules.id, key))
		.returning();
	if (key !== "all" && rows.length === 0) {
		return { success: false, error: "Pianificazione non trovata." };
	}
	for (const row of rows) await (paused ? deactivate(row) : activate(row));
	return { success: true };
}

export async function getSchedulerOverview(
	window: TimelineWindow
): Promise<SchedulerOverview> {
	const boss = await queueSender();
	const db = consoleDb();
	const now = new Date();
	const start = new Date(now.getTime() - WINDOWS[window].pastMs);
	const end = new Date(now.getTime() + WINDOWS[window].futureMs);

	const schedules = await listSchedules();
	const keys = schedules.map(schedule => schedule.key);
	const [past, [running], [failed]] = await Promise.all([
		keys.length
			? db
					.select({
						key: jobRuns.scheduleKey,
						id: jobRuns.id,
						status: jobRuns.status,
						queuedAt: jobRuns.queuedAt,
					})
					.from(jobRuns)
					.where(
						and(
							inArray(jobRuns.scheduleKey, keys),
							gte(jobRuns.queuedAt, start.toISOString())
						)
					)
					.orderBy(asc(jobRuns.queuedAt))
			: Promise.resolve([]),
		db.select({ n: count() }).from(jobRuns).where(eq(jobRuns.status, "RUNNING")),
		db
			.select({ n: count() })
			.from(jobRuns)
			.where(
				and(
					eq(jobRuns.status, "FAILED"),
					gte(jobRuns.queuedAt, new Date(now.getTime() - 24 * HOUR_MS).toISOString())
				)
			),
	]);

	const rows: TimelineRow[] = schedules.map(schedule => {
		const occurrences = schedule.paused
			? []
			: boss
					.previewSchedule(schedule.cron, {
						tz: SCHEDULE_TIMEZONE,
						from: now,
						count: UPCOMING_CAP + 1,
					})
					.filter(date => date < end);
		return {
			schedule,
			past: past
				.filter(run => run.key === schedule.key)
				.map(({ key: _key, ...run }) => run),
			upcoming: occurrences.slice(0, UPCOMING_CAP).map(date => date.toISOString()),
			truncated: occurrences.length > UPCOMING_CAP,
		};
	});

	const next = schedules
		.filter(schedule => schedule.nextRun)
		.sort((a, b) => a.nextRun!.localeCompare(b.nextRun!))[0];

	return {
		now: now.toISOString(),
		start: start.toISOString(),
		end: end.toISOString(),
		counts: {
			schedules: schedules.length,
			paused: schedules.filter(schedule => schedule.paused).length,
			running: running?.n ?? 0,
			failedLastDay: failed?.n ?? 0,
		},
		next: next ? { job: next.job, at: next.nextRun! } : null,
		rows,
	};
}
