import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";
import { Progress } from "@/components/ui/progress";
import { formatMetricValue } from "@/lib/achievements/format";
import type { AchievementsOverview } from "@/lib/achievements/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

import { AchievementMedal, achievementInk } from "./achievement-medal";

const RECENT = 3;

/** The dashboard's slice: the last few unlocked, plus the closest goal. */
export function AchievementStrip({ overview }: { overview: AchievementsOverview }) {
	const recent = overview.categories
		.flatMap(group => group.achievements)
		.filter(entry => entry.awardedAt !== null)
		.sort((a, b) => b.awardedAt!.localeCompare(a.awardedAt!))
		.slice(0, RECENT);

	const next = overview.nextUp[0];

	if (recent.length === 0 && !next) return null;

	return (
		<InsetCard
			title="Traguardi"
			description={`${overview.unlocked} sbloccati su ${overview.total}`}
			actions={
				<Button asChild variant="ghost" size="sm" className="group">
					<Link to="/user/achievements" className="flex items-center gap-1">
						Tutti i traguardi
						<ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
					</Link>
				</Button>
			}
			panelClassName="p-4"
		>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{recent.map(entry => (
					<div key={entry.key} className="flex items-center gap-2.5">
						<AchievementMedal
							icon={entry.icon}
							accent={entry.accent}
							shape={entry.shape}
							tier={entry.tier}
							size="sm"
						/>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold tracking-tight">
								{entry.name}
							</p>
							<p className="text-muted-foreground text-2xs">
								{formatDate(entry.awardedAt!)}
							</p>
						</div>
					</div>
				))}

				{next?.progress && (
					<div className="border-border min-w-0 sm:border-l sm:ps-5">
						<p className="text-muted-foreground eyebrow text-2xs">Il prossimo</p>
						<p className="mt-1 truncate text-sm font-semibold tracking-tight">
							{next.name}
						</p>
						<div className={cn("mt-1.5", achievementInk(next.accent))}>
							<Progress
								value={next.progress.ratio * 100}
								className="h-1.5 bg-current/15 [&>*]:bg-current"
							/>
						</div>
						<p className="text-muted-foreground text-2xs mt-1.5 tabular-nums">
							{formatMetricValue(next.metric, next.progress.value)} /{" "}
							{formatMetricValue(next.metric, next.progress.target)}
						</p>
					</div>
				)}
			</div>
		</InsetCard>
	);
}
