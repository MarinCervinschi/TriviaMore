import { queryOptions } from "@tanstack/react-query";

import {
	getRunFn,
	getSchedulerOverviewFn,
	getWorkerStatusFn,
	listJobsFn,
	listRunsFn,
	previewCronFn,
} from "./api";
import type { JobRun, TimelineWindow } from "./types";

const ACTIVE_REFRESH_MS = 3000;
const IDLE_REFRESH_MS = 30_000;

const isActive = (run: JobRun) => run.status === "QUEUED" || run.status === "RUNNING";

export const jobQueries = {
	jobs: () =>
		queryOptions({ queryKey: ["jobs", "definitions"], queryFn: () => listJobsFn() }),
	runs: () =>
		queryOptions({
			queryKey: ["jobs", "runs"],
			queryFn: () => listRunsFn(),
			// Fast while something is queued or running, so a run's progress shows without a refresh.
			refetchInterval: query =>
				query.state.data?.some(isActive) ? ACTIVE_REFRESH_MS : IDLE_REFRESH_MS,
		}),
	run: (id: string) =>
		queryOptions({
			queryKey: ["jobs", "runs", id],
			queryFn: () => getRunFn({ data: { id } }),
			refetchInterval: query =>
				query.state.data && isActive(query.state.data) ? ACTIVE_REFRESH_MS : false,
		}),
	worker: () =>
		queryOptions({
			queryKey: ["jobs", "worker"],
			queryFn: () => getWorkerStatusFn(),
			refetchInterval: IDLE_REFRESH_MS,
		}),
	preview: (cron: string) =>
		queryOptions({
			queryKey: ["jobs", "cron-preview", cron],
			queryFn: () => previewCronFn({ data: { cron } }),
			staleTime: 60_000,
		}),
	overview: (window: TimelineWindow) =>
		queryOptions({
			queryKey: ["jobs", "schedules", "overview", window],
			queryFn: () => getSchedulerOverviewFn({ data: { window } }),
			refetchInterval: IDLE_REFRESH_MS,
		}),
};
