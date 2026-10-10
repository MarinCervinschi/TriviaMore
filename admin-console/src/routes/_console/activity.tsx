import { HistoryIcon } from "@solar-icons/react/linear/history";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/_console/activity")({
	component: ActivityPage,
});

function ActivityPage() {
	return (
		<ConsolePage
			title="Attività recenti"
			description="Le azioni fatte dalla console: job avviati e modifiche alle pianificazioni."
		>
			<ComingSoon
				icon={HistoryIcon}
				title="Il registro delle attività"
				description="Ogni azione della console finisce qui, con chi l'ha fatta e quando."
				issue={197}
			/>
		</ConsolePage>
	);
}
