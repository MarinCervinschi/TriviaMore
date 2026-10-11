import { type Status, StatusBadge } from "~/components/status-badge";
import { formatDateTime } from "~/lib/format";
import type { JobRun, JobRunStatus } from "~/lib/jobs/types";

export const RUN_STATUS: Record<JobRunStatus, { label: string; status: Status }> = {
	QUEUED: { label: "In coda", status: "neutral" },
	RUNNING: { label: "In corso", status: "info" },
	SUCCEEDED: { label: "Riuscita", status: "success" },
	FAILED: { label: "Fallita", status: "danger" },
	CANCELLED: { label: "Fermata", status: "warning" },
};

export function RunStatusBadge({ status }: { status: JobRunStatus }) {
	return (
		<StatusBadge status={RUN_STATUS[status].status}>
			{RUN_STATUS[status].label}
		</StatusBadge>
	);
}

/** Where a run that writes stands, dated by the moment that status began; `target` names the database. */
export function applyOutcome(
	run: Pick<JobRun, "status" | "queuedAt" | "startedAt" | "finishedAt">,
	target?: string
): string {
	const where = target ? ` ${target}` : "";
	switch (run.status) {
		case "QUEUED":
			return `Da applicare${where}, in coda dal ${formatDateTime(run.queuedAt)}`;
		case "RUNNING":
			return `Applicazione${where} in corso dal ${formatDateTime(run.startedAt ?? run.queuedAt)}`;
		case "SUCCEEDED":
			return `Applicata${where} il ${formatDateTime(run.finishedAt)}`;
		case "FAILED":
			return `Applicazione${where} fallita il ${formatDateTime(run.finishedAt)}`;
		case "CANCELLED":
			return `Applicazione${where} fermata il ${formatDateTime(run.finishedAt)}`;
	}
}
