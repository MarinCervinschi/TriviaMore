import { type ReactNode, useState } from "react";

import { InlineEmpty } from "@/components/ui/empty-state";
import type { AchievementView } from "@/lib/achievements/types";

import { AchievementDialog } from "./achievement-dialog";
import { AchievementTile } from "./achievement-tile";

export const ACHIEVEMENT_FILTERS = ["tutti", "sbloccati", "in-corso"] as const;
export type AchievementFilter = (typeof ACHIEVEMENT_FILTERS)[number];

/**
 * One category as a grid of medals. It owns the filtering, so the header count and
 * the body cannot drift apart.
 */
export function AchievementGroup({
	category,
	achievements,
	filter = "tutti",
	actions,
}: {
	category: string;
	achievements: AchievementView[];
	filter?: AchievementFilter;
	actions?: ReactNode;
}) {
	const [open, setOpen] = useState<AchievementView | null>(null);

	const unlocked = achievements.filter(entry => entry.awardedAt !== null).length;
	const shown = achievements.filter(entry =>
		filter === "sbloccati"
			? entry.awardedAt !== null
			: filter === "in-corso"
				? entry.awardedAt === null
				: true
	);

	const family = open
		? achievements
				.filter(entry => entry.family === open.family)
				.sort((a, b) => a.tier - b.tier)
		: [];

	return (
		<section aria-label={category} className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-muted-foreground text-sm">
					{unlocked} di {achievements.length} sbloccati in {category}
				</p>
				{actions}
			</div>

			{shown.length === 0 ? (
				<InlineEmpty>
					{filter === "sbloccati"
						? "Nessun traguardo di questa categoria sbloccato, per ora."
						: "Li hai sbloccati tutti, in questa categoria."}
				</InlineEmpty>
			) : (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{shown.map(achievement => (
						<AchievementTile
							key={achievement.key}
							achievement={achievement}
							onOpen={setOpen}
						/>
					))}
				</div>
			)}

			<AchievementDialog
				achievement={open}
				family={family}
				onOpenChange={isOpen => !isOpen && setOpen(null)}
			/>
		</section>
	);
}
