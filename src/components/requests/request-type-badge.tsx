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
		className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	NEW_QUESTIONS: {
		label: "Nuove domande",
		icon: ChatRoundDotsIcon,
		className:
			"border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	REPORT: {
		label: "Segnalazione",
		icon: FlagIcon,
		className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
	},
	FILE_UPLOAD: {
		label: "File caricato",
		icon: CloudUploadIcon,
		className:
			"border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	},
};

export function RequestTypeBadge({ type }: { type: ContentRequestType }) {
	const config = typeConfig[type];
	return (
		<ConfigBadge label={config.label} className={config.className} icon={config.icon} />
	);
}
