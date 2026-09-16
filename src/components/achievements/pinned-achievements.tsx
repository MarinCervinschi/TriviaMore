import { Link } from "@tanstack/react-router";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AchievementView } from "@/lib/achievements/types";

import { AchievementMedal } from "./achievement-medal";

/**
 * The medals the student chose, beside their role. The tooltip is never the
 * accessible name — Radix wires it as `aria-describedby` — so each carries its own.
 */
export function PinnedAchievements({ pinned }: { pinned: AchievementView[] }) {
	if (pinned.length === 0) return null;

	return (
		<TooltipProvider delayDuration={200}>
			<Link
				to="/user/achievements"
				aria-label="I tuoi traguardi in evidenza"
				className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				{pinned.map(entry => (
					<Tooltip key={entry.key}>
						{/* A span, not the default button: a button inside an anchor is
						    invalid, and the anchor is what carries the navigation. */}
						<TooltipTrigger asChild>
							<span className="inline-flex">
								<AchievementMedal
									icon={entry.icon}
									accent={entry.accent}
									shape={entry.shape}
									tier={entry.tier}
									size="sm"
									className="transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none"
								/>
								<span className="sr-only">{entry.name}</span>
							</span>
						</TooltipTrigger>
						<TooltipContent side="bottom">{entry.name}</TooltipContent>
					</Tooltip>
				))}
			</Link>
		</TooltipProvider>
	);
}
