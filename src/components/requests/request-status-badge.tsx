import type { ContentRequestStatus } from "@/lib/requests/types";

import { ConfigBadge } from "./config-badge";

const statusConfig: Record<ContentRequestStatus, { label: string; className: string }> =
	{
		PENDING: {
			label: "In attesa",
			className: "border-warning/30 bg-warning/10 text-warning",
		},
		APPROVED: {
			label: "Approvata",
			className: "border-success/30 bg-success/10 text-success",
		},
		REJECTED: {
			label: "Rifiutata",
			className: "border-danger/30 bg-danger/10 text-danger",
		},
		NEEDS_REVISION: {
			label: "Da revisionare",
			className: "border-info/30 bg-info/10 text-info",
		},
	};

export function RequestStatusBadge({ status }: { status: ContentRequestStatus }) {
	const config = statusConfig[status];
	return <ConfigBadge label={config.label} className={config.className} />;
}
