import { useState } from "react";

import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";

import { TickArc } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";
import { formatMetricValue } from "@/lib/achievements/format";
import type { AchievementCategory, AchievementView } from "@/lib/achievements/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

import { AchievementMedal, achievementInk } from "./achievement-medal";
import { PinPicker } from "./pin-picker";

const PIN_SLOTS = 3;
const TIER_NAME: Record<number, string> = { 1: "I", 2: "II", 3: "III" };

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-baseline justify-between gap-3 py-1.5">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="truncate text-sm font-semibold">{children}</span>
		</div>
	);
}

/** The fixed head of the page: standing, pinned medals, and the closest goals. */
export function AchievementSummary({
	unlocked,
	total,
	categories,
	nextUp,
	pinned,
}: {
	unlocked: number;
	total: number;
	categories: AchievementCategory[];
	nextUp: AchievementView[];
	pinned: AchievementView[];
}) {
	const [picking, setPicking] = useState(false);

	const earned = categories
		.flatMap(group => group.achievements)
		.filter(entry => entry.awardedAt !== null);

	const started = categories.filter(group =>
		group.achievements.some(entry => entry.awardedAt !== null)
	).length;
	const complete = categories.filter(group =>
		group.achievements.every(entry => entry.awardedAt !== null)
	).length;
	const last = [...earned].sort((a, b) => b.awardedAt!.localeCompare(a.awardedAt!))[0];
	const topTier = earned.reduce((max, entry) => Math.max(max, entry.tier), 0);

	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
			<InsetCard
				title="I tuoi traguardi"
				description={`${started} categorie su ${categories.length} iniziate`}
				panelClassName="p-5"
				footer={
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<span className="text-muted-foreground eyebrow">In evidenza</span>
							<div className="flex items-center gap-2">
								{Array.from({ length: PIN_SLOTS }).map((_, slot) => {
									const entry = pinned[slot];
									return entry ? (
										<AchievementMedal
											key={entry.key}
											icon={entry.icon}
											accent={entry.accent}
											shape={entry.shape}
											tier={entry.tier}
											size="sm"
										/>
									) : (
										<span
											key={slot}
											className="border-border size-10 rounded-full border border-dashed"
											aria-hidden
										/>
									);
								})}
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setPicking(true)}
							disabled={earned.length === 0}
						>
							<PenNewSquareIcon className="size-3.5" />
							Scegli
						</Button>
					</div>
				}
			>
				<div className="flex items-center gap-6">
					<TickArc
						value={unlocked}
						max={total}
						label={String(unlocked)}
						caption={`di ${total}`}
						className="w-[150px] shrink-0"
					/>
					<dl className="divide-border/60 min-w-0 flex-1 divide-y">
						<Fact label="Ultimo sbloccato">
							{last ? last.name : "—"}
							{last && (
								<span className="text-muted-foreground ms-2 font-normal">
									{formatDate(last.awardedAt!)}
								</span>
							)}
						</Fact>
						<Fact label="Categorie complete">
							{complete} di {categories.length}
						</Fact>
						<Fact label="Livello più alto">
							{topTier > 0 ? TIER_NAME[topTier] : "—"}
						</Fact>
					</dl>
				</div>
			</InsetCard>

			<InsetCard
				title="I più vicini"
				description="I traguardi a cui manca meno."
				panelClassName="p-2"
			>
				{nextUp.length === 0 ? (
					<p className="text-muted-foreground p-3 text-sm">
						Niente in corso: quelli rimasti si sbloccano in una volta sola.
					</p>
				) : (
					<ul className="flex flex-col">
						{nextUp.map(entry => (
							<li key={entry.key} className="flex items-center gap-3 px-3 py-2.5">
								<AchievementMedal
									icon={entry.icon}
									accent={entry.accent}
									shape={entry.shape}
									tier={entry.tier}
									locked
									size="sm"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold tracking-tight">
										{entry.name}
									</p>
									<p className="text-muted-foreground text-2xs truncate">
										{entry.description}
									</p>
								</div>
								<span
									className={cn(
										"shrink-0 text-sm font-semibold tabular-nums",
										achievementInk(entry.accent)
									)}
								>
									{formatMetricValue(entry.metric, entry.progress!.value)}
									<span className="text-muted-foreground font-normal">
										{" "}
										/ {formatMetricValue(entry.metric, entry.progress!.target)}
									</span>
								</span>
							</li>
						))}
					</ul>
				)}
			</InsetCard>

			<PinPicker
				open={picking}
				onOpenChange={setPicking}
				unlocked={earned}
				pinned={pinned}
			/>
		</div>
	);
}
