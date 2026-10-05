import { RecentAttempts } from "@/components/progress/recent-attempts";
import type { AttemptHistoryEntry } from "@/lib/user/types";

export function ActivitySection({
	attempts,
	total,
}: {
	attempts: AttemptHistoryEntry[];
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
