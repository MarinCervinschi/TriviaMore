import { LayersIcon } from "@solar-icons/react/linear/layers";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/staging/promotions")({
	component: PromotionsPage,
});

function PromotionsPage() {
	return (
		<ConsolePage
			title="Promozioni"
			description="Il passaggio dei dati approvati dallo staging alla produzione."
		>
			<ComingSoon
				icon={LayersIcon}
				title="Le promozioni"
				description="Si vede cosa cambierebbe, si approva, si applica in una transazione."
				issue={196}
			/>
		</ConsolePage>
	);
}
