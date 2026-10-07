import { ShieldKeyholeIcon } from "@solar-icons/react/linear/shield-keyhole";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/settings/access")({
	component: AccessPage,
});

function AccessPage() {
	return (
		<ConsolePage
			title="Accesso"
			description="Chi può entrare nella console, e da dove."
		>
			<ComingSoon
				icon={ShieldKeyholeIcon}
				title="L'accesso"
				description="Solo dal tailnet, e solo con l'account del proprietario."
				issue={194}
			/>
		</ConsolePage>
	);
}
