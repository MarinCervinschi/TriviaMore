import { type Status, StatusBadge } from "~/components/status-badge";
import type { JobRunStatus } from "~/lib/jobs/types";

export const RUN_STATUS: Record<JobRunStatus, { label: string; status: Status }> = {
	QUEUED: { label: "In coda", status: "neutral" },
	RUNNING: { label: "In corso", status: "info" },
	SUCCEEDED: { label: "Riuscita", status: "success" },
	FAILED: { label: "Fallita", status: "danger" },
	CANCELLED: { label: "Annullata", status: "neutral" },
};

export function RunStatusBadge({ status }: { status: JobRunStatus }) {
	return (
		<StatusBadge status={RUN_STATUS[status].status}>
			{RUN_STATUS[status].label}
		</StatusBadge>
	);
}
