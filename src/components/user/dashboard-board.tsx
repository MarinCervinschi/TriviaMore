import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The dashboard's middle band: the career and the traguardi side by side, then the calendar at full width. */
export function DashboardBoard({
	calendar,
	career,
	achievements,
}: {
	calendar: ReactNode;
	career: ReactNode;
	achievements: ReactNode;
}) {
	const pair = [career, achievements].filter(Boolean);
	if (!calendar && pair.length === 0) return null;

	return (
		<div className="flex flex-col gap-6">
			{pair.length > 0 && (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{pair.map((card, i) => (
						<div
							key={i}
							className={cn(
								"flex min-w-0 flex-col *:flex-1",
								pair.length === 1 && "lg:col-span-2"
							)}
						>
							{card}
						</div>
					))}
				</div>
			)}
			{calendar}
		</div>
	);
}
