import { AddFolderIcon } from "@solar-icons/react/linear/add-folder";
import { ChatRoundDotsIcon } from "@solar-icons/react/linear/chat-round-dots";
import { CloudUploadIcon } from "@solar-icons/react/linear/cloud-upload";
import { FlagIcon } from "@solar-icons/react/linear/flag";

import type { Icon } from "@/components/icons";
import type { ContentRequestType } from "@/lib/requests/types";

import { ConfigBadge } from "./config-badge";

const typeConfig: Record<
	ContentRequestType,
	{ label: string; icon: Icon; className: string }
> = {
	NEW_SECTION: {
		label: "Nuova sezione",
		icon: AddFolderIcon,
		className: "border-chart-2/30 bg-chart-2/10 text-chart-2-ink",
	},
	NEW_QUESTIONS: {
		label: "Nuove domande",
		icon: ChatRoundDotsIcon,
		className: "border-chart-4/30 bg-chart-4/10 text-chart-4-ink",
	},
	REPORT: {
		label: "Segnalazione",
		icon: FlagIcon,
		className: "border-chart-1/30 bg-chart-1/10 text-chart-1-ink",
	},
	FILE_UPLOAD: {
		label: "File caricato",
		icon: CloudUploadIcon,
		className: "border-chart-3/30 bg-chart-3/10 text-chart-3-ink",
	},
};

export function RequestTypeBadge({ type }: { type: ContentRequestType }) {
	const config = typeConfig[type];
	return (
		<ConfigBadge label={config.label} className={config.className} icon={config.icon} />
	);
}
