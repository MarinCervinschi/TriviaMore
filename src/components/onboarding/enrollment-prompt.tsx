import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";

/** What reaches the accounts made before the wizard existed: they never see it
 *  at signup, so the dashboard is the only place left to ask. */
export function EnrollmentPrompt() {
	return (
		<InsetCard panelClassName="p-4 sm:p-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<IconTile size="lg" variant="soft" className="shrink-0">
					<DiplomaIcon />
				</IconTile>
				<div className="min-w-0 flex-1">
					<p className="font-semibold">Dicci cosa studi</p>
					<p className="text-muted-foreground text-sm">
						Collega il tuo corso di studi per sbloccare carriera, medie e base di
						laurea. Bastano due passaggi.
					</p>
				</div>
				<Button asChild className="shrink-0">
					<Link to="/onboarding">Completa il profilo</Link>
				</Button>
			</div>
		</InsetCard>
	);
}
