import { TickBar } from "@/components/charts";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatMetricValue } from "@/lib/achievements/format";
import type { AchievementView } from "@/lib/achievements/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

import { AchievementMedal, achievementInk } from "./achievement-medal";

/** One achievement in full, with its family's tier chain. */
export function AchievementDialog({
	achievement,
	family,
	onOpenChange,
}: {
	achievement: AchievementView | null;
	family: AchievementView[];
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={achievement !== null} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				{achievement && (
					<>
						<DialogHeader className="items-center text-center">
							<AchievementMedal
								icon={achievement.icon}
								accent={achievement.accent}
								shape={achievement.shape}
								tier={achievement.tier}
								locked={achievement.awardedAt === null}
								size="2xl"
								className="mb-3"
							/>
							<p className="text-muted-foreground eyebrow">{achievement.category}</p>
							<DialogTitle className="text-2xl">{achievement.name}</DialogTitle>
							<DialogDescription className="text-balance">
								{achievement.description}
							</DialogDescription>
						</DialogHeader>

						{achievement.awardedAt ? (
							<p className="text-muted-foreground text-center text-sm">
								Sbloccato il {formatDate(achievement.awardedAt)}
							</p>
						) : achievement.progress ? (
							<div className={cn("px-2", achievementInk(achievement.accent))}>
								<TickBar
									value={achievement.progress.value}
									max={achievement.progress.target}
									tone="current"
								/>
								<p className="text-muted-foreground mt-2 text-center text-sm tabular-nums">
									{formatMetricValue(achievement.metric, achievement.progress.value)} di{" "}
									{formatMetricValue(achievement.metric, achievement.progress.target)}
								</p>
							</div>
						) : (
							<p className="text-muted-foreground text-center text-sm">
								Si sblocca in una volta sola: o è fatto, o non ancora.
							</p>
						)}

						{family.length > 1 && (
							<div className="border-border/60 flex flex-col gap-3 border-t pt-4">
								<p className="text-muted-foreground eyebrow text-center">
									I livelli di questo traguardo
								</p>
								<div className="flex items-start justify-center gap-5">
									{family.map(step => (
										<div
											key={step.key}
											className={cn(
												"flex w-20 flex-col items-center gap-1.5 text-center",
												step.key === achievement.key && "font-semibold"
											)}
										>
											<AchievementMedal
												icon={step.icon}
												accent={step.accent}
												shape={step.shape}
												tier={step.tier}
												locked={step.awardedAt === null}
												size="sm"
											/>
											<span
												className={cn(
													"text-2xs leading-tight",
													step.awardedAt === null
														? "text-muted-foreground"
														: "text-foreground"
												)}
											>
												{step.name}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
