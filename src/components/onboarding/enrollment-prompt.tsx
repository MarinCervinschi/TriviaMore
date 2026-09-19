import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";

/** What reaches the accounts made before the wizard existed: they never see it
 *  at signup, so the dashboard is the only place left to ask. Sized to sit
 *  beside the profile in the hero, not to span the page. */
export function EnrollmentPrompt() {
	return (
		<InsetCard className="w-full lg:w-72 lg:shrink-0" panelClassName="p-3.5">
			<div className="flex items-center gap-3">
				<IconTile size="sm" variant="soft" className="shrink-0">
					<DiplomaIcon />
				</IconTile>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold">Dicci cosa studi</p>
					<p className="text-muted-foreground text-xs">
						Carriera, medie e base di laurea partono da qui.
					</p>
				</div>
			</div>
			<Button asChild size="sm" className="mt-3 w-full">
				<Link to="/onboarding">Completa il profilo</Link>
			</Button>
		</InsetCard>
	);
}
