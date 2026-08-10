import { BoxMinimalisticIcon } from "@solar-icons/react/linear/box-minimalistic";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";

import { EmptyState } from "@/components/ui/empty-state";

export function BrowseEmptyState({
	message = "Nessun risultato trovato.",
}: {
	message?: string;
}) {
	return (
		<EmptyState
			icon={MagnifierIcon}
			title={message}
			description="Prova a cercare qualcos'altro"
		/>
	);
}

export function BrowseContributeState({
	message,
	children,
}: {
	message: string;
	children?: React.ReactNode;
}) {
	return (
		<EmptyState
			icon={BoxMinimalisticIcon}
			title={message}
			description="Aiutaci a far crescere la piattaforma contribuendo con nuovi contenuti!"
		>
			{children}
		</EmptyState>
	);
}
