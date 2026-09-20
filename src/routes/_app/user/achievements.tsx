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
import { ANALYTICS_TABS } from "@/components/layout/nav-items";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import { AchievementsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { TabNav } from "@/components/ui/tab-nav";
import { achievementQueries } from "@/lib/achievements/queries";
import { seoHead } from "@/lib/seo";

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
				<PageToolbar tabs={ANALYTICS_TABS} title="Analytics" />
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

	return (
		<div className="container space-y-6 py-6 pb-10">
			<PageToolbar tabs={ANALYTICS_TABS} title="Analytics" />

			<AchievementSummary
				unlocked={data.unlocked}
				total={data.total}
				categories={data.categories}
				nextUp={data.nextUp}
				pinned={data.pinned}
			/>

			<TabNav
				label="Categorie"
				tabs={data.categories.map(group => ({
					key: group.category,
					label: group.category,
					badge: `${group.achievements.filter(entry => entry.awardedAt !== null).length}/${group.achievements.length}`,
					active: group.category === active.category,
					onSelect: () =>
						navigate({
							search: prev => ({ ...prev, categoria: group.category }),
							replace: true,
						}),
				}))}
			/>

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
