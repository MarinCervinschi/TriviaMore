import { FileUp, Flag, FolderPlus, MessageSquarePlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ContentRequestType } from "@/lib/requests/types";

import { ConfigBadge } from "./config-badge";

const typeConfig: Record<
	ContentRequestType,
	{ label: string; icon: LucideIcon; className: string }
> = {
	NEW_SECTION: {
		label: "Nuova sezione",
		icon: FolderPlus,
		className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	NEW_QUESTIONS: {
		label: "Nuove domande",
		icon: MessageSquarePlus,
		className:
			"border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	REPORT: {
		label: "Segnalazione",
		icon: Flag,
		className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
	},
	FILE_UPLOAD: {
		label: "File caricato",
		icon: FileUp,
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
