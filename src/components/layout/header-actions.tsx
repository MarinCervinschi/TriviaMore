import { useMatches, useNavigate, useSearch } from "@tanstack/react-router";

import { AnalyticsWindowChips } from "@/components/progress/analytics-window-chips";
import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";

/** The one route whose controls belong in the shell's header. */
const ANALYTICS_OVERVIEW = "/_app/user/analytics/";

/**
 * Controls the header carries for the route below it, derived from the matches like
 * the trail is — no context and no portal, so they are there on the first paint.
 *
 * The window lives in the URL, which is what lets two components read it without
 * either owning it: the header writes the search params, the page reads them.
 */
export function HeaderActions() {
	const matches = useMatches();
	const onOverview = matches.some(match => match.routeId === ANALYTICS_OVERVIEW);

	return onOverview ? <AnalyticsWindow /> : null;
}

function AnalyticsWindow() {
	const search = useSearch({ strict: false }) as {
		periodo?: ExplorerPeriod;
		modalita?: ExplorerMode;
	};
	const navigate = useNavigate();

	return (
		<AnalyticsWindowChips
			period={search.periodo ?? "year"}
			mode={search.modalita ?? "both"}
			onPeriodChange={periodo =>
				navigate({ to: ".", search: (prev: object) => ({ ...prev, periodo }) })
			}
			onModeChange={modalita =>
				navigate({ to: ".", search: (prev: object) => ({ ...prev, modalita }) })
			}
		/>
	);
}
