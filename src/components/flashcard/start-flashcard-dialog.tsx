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
	const [cardCount, setCardCount] = useState(Math.min(20, maxQuestions));
	const mutation = useStartFlashcard(() => onOpenChange(false));

	return (
		<SessionDialogShell open={open} onOpenChange={onOpenChange}>
			<SessionDialogColumn
				title="Configura Flashcard"
				description="Scegli quante carte vuoi studiare"
				submitLabel="Inizia Flashcard"
				onSubmit={() =>
					mutation.mutate({
						sectionId,
						cardCount: Math.min(cardCount, maxQuestions),
					})
				}
				onCancel={() => onOpenChange(false)}
				isPending={mutation.isPending}
			>
				<FlashcardConfigFields
					cardCount={cardCount}
					setCardCount={setCardCount}
					maxCards={maxQuestions}
				/>
			</SessionDialogColumn>

			<SummaryPanel footerTip="Le flashcard non vengono salvate come tentativo. Studia in pace.">
				<FlashcardSummary cardCount={cardCount} maxCards={maxQuestions} />
			</SummaryPanel>
		</SessionDialogShell>
	);
}
