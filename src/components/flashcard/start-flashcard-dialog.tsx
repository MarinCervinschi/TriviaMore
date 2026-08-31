import { useState } from "react";

import {
	FlashcardConfigFields,
	FlashcardSummary,
} from "@/components/session-config/flashcard-config";
import {
	SessionDialogColumn,
	SessionDialogShell,
} from "@/components/session-config/session-dialog";
import { SummaryPanel } from "@/components/session-config/summary-panel";
import { useStartFlashcard } from "@/lib/flashcard/mutations";
import { sessionCap } from "@/lib/shared/session";

export function StartFlashcardDialog({
	open,
	onOpenChange,
	sectionId,
	maxQuestions,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sectionId: string;
	maxQuestions: number;
}) {
	const cap = sessionCap(maxQuestions);
	const [cardCount, setCardCount] = useState(Math.min(20, cap));
	const mutation = useStartFlashcard(() => onOpenChange(false));

	return (
		<SessionDialogShell open={open} onOpenChange={onOpenChange}>
			<SessionDialogColumn
				title="Configura flashcard"
				description="Scegli quante carte vuoi studiare"
				submitLabel="Inizia Flashcard"
				onSubmit={() =>
					mutation.mutate({
						sectionId,
						cardCount: Math.min(cardCount, cap),
					})
				}
				onCancel={() => onOpenChange(false)}
				isPending={mutation.isPending}
			>
				<FlashcardConfigFields
					cardCount={cardCount}
					setCardCount={setCardCount}
					maxCards={cap}
					available={maxQuestions}
				/>
			</SessionDialogColumn>

			<SummaryPanel footerTip="Le flashcard non vengono salvate come tentativo. Studia in pace.">
				<FlashcardSummary cardCount={cardCount} maxCards={maxQuestions} />
			</SummaryPanel>
		</SessionDialogShell>
	);
}
