import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { HourglassIcon } from "@solar-icons/react/linear/hourglass";
import { MedalRibbonStarIcon } from "@solar-icons/react/linear/medal-ribbon-star";
import { WidgetIcon } from "@solar-icons/react/linear/widget";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
	ACHIEVEMENT_FILTERS,
	type AchievementFilter,
	AchievementGroup,
} from "@/components/achievements/achievement-group";
import { AchievementSummary } from "@/components/achievements/achievement-summary";
import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import { AchievementsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { achievementQueries } from "@/lib/achievements/queries";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: ChipOption<AchievementFilter>[] = [
	{ value: "tutti", label: "Tutti", icon: WidgetIcon },
	{ value: "sbloccati", label: "Sbloccati", icon: CheckCircleIcon },
	{ value: "in-corso", label: "In corso", icon: HourglassIcon },
];

export const Route = createFileRoute("/_app/user/achievements")({
	validateSearch: z.object({
		stato: z.enum(ACHIEVEMENT_FILTERS).default("tutti").catch("tutti"),
		categoria: z.string().optional().catch(undefined),
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(achievementQueries.all()),
	head: () => seoHead({ title: "Traguardi", noindex: true }),
	pendingComponent: AchievementsSkeleton,
	component: AchievementsPage,
});

function AchievementsPage() {
	const { stato, categoria } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { data } = useSuspenseQuery(achievementQueries.all());

	if (data.total === 0) {
		return (
			<div className="container space-y-6 py-6 pb-10">
				<UserBreadcrumb current="Traguardi" currentIcon={MedalRibbonStarIcon} />
				<EmptyState
					icon={MedalRibbonStarIcon}
					title="Nessun traguardo ancora in catalogo"
					description="Appena ce ne sarà uno, comparirà qui con il suo obiettivo."
					actionLabel="Torna alla dashboard"
					actionHref="/user"
				/>
			</div>
		);
	}

	// An unknown category falls back to the first: a tab is navigation, not a filter
	// that can legitimately match nothing.
	const active =
		data.categories.find(group => group.category === categoria) ?? data.categories[0]!;

	// No hero: the breadcrumb names the page and the space goes to the medals.
	return (
		<div className="container space-y-6 py-6 pb-10">
			<UserBreadcrumb current="Traguardi" currentIcon={MedalRibbonStarIcon} />

			<AchievementSummary
				unlocked={data.unlocked}
				total={data.total}
				categories={data.categories}
				nextUp={data.nextUp}
				pinned={data.pinned}
			/>

			<div>
				{/* Both properties, as `CalendarHeatmap` does: the row scrolls without a bar. */}
				<div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div role="tablist" aria-label="Categorie" className="flex w-max gap-9">
						{data.categories.map(group => {
							const done = group.achievements.filter(
								entry => entry.awardedAt !== null
							).length;
							const current = group.category === active.category;

							return (
								<button
									key={group.category}
									type="button"
									role="tab"
									aria-selected={current}
									onClick={() =>
										navigate({
											search: prev => ({ ...prev, categoria: group.category }),
											replace: true,
										})
									}
									className={cn(
										"focus-visible:ring-ring relative inline-flex shrink-0 items-center gap-2 px-1 pb-2.5 text-sm whitespace-nowrap transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
										current
											? "text-foreground font-semibold"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									{group.category}
									<span
										className={cn(
											"text-2xs rounded-md px-1.5 py-0.5 tabular-nums",
											current
												? "bg-muted text-foreground"
												: "bg-muted/60 text-muted-foreground"
										)}
									>
										{done}/{group.achievements.length}
									</span>
									{/* A span, not a border: `globals.css` sets `border-color` on `*`
										    outside any layer, so `border-transparent` never applies. */}
									{current && (
										<span
											className="bg-foreground absolute inset-x-0 bottom-0 h-0.5 rounded-full"
											aria-hidden
										/>
									)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<AchievementGroup
				category={active.category}
				achievements={active.achievements}
				filter={stato}
				actions={
					<SelectChip
						label="Stato"
						value={stato}
						onChange={value =>
							navigate({ search: prev => ({ ...prev, stato: value }), replace: true })
						}
						options={FILTER_OPTIONS}
					/>
				}
			/>
		</div>
	);
}
