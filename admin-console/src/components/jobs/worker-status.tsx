import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import { InsetCard } from "@/components/ui/inset-card";

import { StatusBadge } from "~/components/status-badge";
import { formatDateTime } from "~/lib/format";
import { jobQueries } from "~/lib/jobs/queries";

/** Whether anything will pick up a queued run: without the worker a run stays queued. */
export function WorkerStatusLine() {
	const { data: worker } = useQuery(jobQueries.worker());
	if (!worker) return null;

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
			<StatusBadge status={worker.online ? "success" : "warning"}>
				{worker.online ? "Worker attivo" : "Worker spento"}
			</StatusBadge>
			<span className="text-muted-foreground">
				{worker.online
					? [worker.host, worker.memoryMb && `${worker.memoryMb} MB`]
							.filter(Boolean)
							.join(" · ")
					: worker.lastSeen
						? `Ultimo segnale il ${formatDateTime(worker.lastSeen)}. Le esecuzioni restano in coda finché non lo avvii con pnpm console:worker.`
						: "Le esecuzioni restano in coda finché non lo avvii con pnpm console:worker."}
			</span>
		</div>
	);
}

/** The worker's state in a bar of its own, with the page's queue-wide actions on the right. */
export function WorkerBar({ children }: { children?: ReactNode }) {
	return (
		<InsetCard>
			<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
				<WorkerStatusLine />
				{children && <div className="flex gap-2">{children}</div>}
			</div>
		</InsetCard>
	);
}
