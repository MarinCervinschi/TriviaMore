import { InsetCard } from "@/components/ui/inset-card";
import type { PlanActivity } from "@/lib/browse/types";

export function PlanActivities({
	activities,
	notes,
}: {
	activities: PlanActivity[];
	// The curricula an activity belongs to, for one that not every curriculum lists.
	notes?: Map<string, string>;
}) {
	if (activities.length === 0) return null;

	return (
		<section className="mt-10">
			<h2 className="text-lg font-semibold">Altre attività del piano</h2>
			<p className="text-muted-foreground mt-1 mb-4 text-sm">
				Tirocini, prove finali e altre attività previste dal piano, senza materiale da
				studiare.
			</p>
			<InsetCard panelClassName="divide-y">
				{activities.map(activity => (
					<div
						key={activity.id}
						className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm"
					>
						<span className="min-w-0 truncate">
							{activity.name}
							{notes?.get(activity.id) && (
								<span className="text-muted-foreground">
									{" "}
									· {notes.get(activity.id)}
								</span>
							)}
						</span>
						<span className="text-muted-foreground shrink-0 tabular-nums">
							{activity.classYear}° anno
							{activity.cfu !== null && ` · ${activity.cfu} CFU`}
						</span>
					</div>
				))}
			</InsetCard>
		</section>
	);
}
