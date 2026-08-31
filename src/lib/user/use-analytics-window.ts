import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import type { ExplorerMode, ExplorerPeriod } from "./metric-explorer";
import { windowFromDate } from "./metric-explorer";

/** The two search params every analytics page carries. Absent means the default. */
export const analyticsWindowSearch = {
	periodo: z.enum(["week", "month", "year", "all"]).optional().catch(undefined),
	modalita: z.enum(["both", "STUDY", "EXAM_SIMULATION"]).optional().catch(undefined),
};

export type AnalyticsWindowSearch = {
	periodo?: ExplorerPeriod;
	modalita?: ExplorerMode;
};

/** The window as page state: in the URL, so the route can narrow the mastery query on it. */
export function useAnalyticsWindow(search: AnalyticsWindowSearch, from: string) {
	const navigate = useNavigate({ from: from as never });
	const period = search.periodo ?? "year";
	const mode = search.modalita ?? "both";

	return {
		period,
		mode,
		onPeriodChange: (periodo: ExplorerPeriod) =>
			navigate({ search: (prev: object) => ({ ...prev, periodo }) } as never),
		onModeChange: (modalita: ExplorerMode) =>
			navigate({ search: (prev: object) => ({ ...prev, modalita }) } as never),
		masteryWindow: {
			from: windowFromDate(period, new Date()),
			mode: mode === "both" ? undefined : mode,
		},
	};
}
