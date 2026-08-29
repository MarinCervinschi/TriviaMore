import { RecentAttempts } from "@/components/progress/recent-attempts";
import type { AttemptHistoryEntry } from "@/lib/user/types";

/**
 * The dashboard's closing block: the last few sittings, and the way through to
 * the full history. The study calendar used to live here too — it moved to the
 * analytics page, where it sits beside the streaks it belongs with.
 */
export function ActivitySection({
	attempts,
	total,
}: {
	attempts: AttemptHistoryEntry[];
	/** Every quiz ever completed, which this list is only the tail of. */
	total?: number;
}) {
	return (
		<div className="space-y-4">
			<div>
				<p className="text-brand eyebrow-lg">La tua attività</p>
				<h2 className="text-xl font-bold">Il tuo percorso</h2>
			</div>

			<RecentAttempts attempts={attempts} total={total} />
		</div>
	);
}
