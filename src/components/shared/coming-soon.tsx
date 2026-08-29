import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * A control that is drawn but not wired yet. The child must be disabled by the
 * caller — this only explains why. The wrapping span is load-bearing: a disabled
 * button fires no pointer events, so without it the tooltip would never open and
 * the control would read as broken rather than as coming.
 *
 * Needs a `TooltipProvider` above it, as every tooltip in the app does.
 */
export function ComingSoon({
	children,
	note = "In arrivo prossimamente",
}: {
	children: ReactNode;
	note?: string;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span tabIndex={0} className="inline-flex rounded-lg">
					{children}
				</span>
			</TooltipTrigger>
			<TooltipContent>{note}</TooltipContent>
		</Tooltip>
	);
}
