import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { QuizConfigFields, QuizSummary } from "@/components/session-config/quiz-config";
import {
	SessionDialogColumn,
	SessionDialogShell,
} from "@/components/session-config/session-dialog";
import { SummaryPanel } from "@/components/session-config/summary-panel";
import { TIME_STEPS } from "@/lib/quiz/constants";
import { useStartQuiz } from "@/lib/quiz/mutations";
import { quizQueries } from "@/lib/quiz/queries";

export function StartQuizDialog({
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
	const [questionCount, setQuestionCount] = useState(Math.min(11, maxQuestions));
	const [timeStepIndex, setTimeStepIndex] = useState(TIME_STEPS.indexOf(30));
	const [evalModeId, setEvalModeId] = useState<string | undefined>();

	const { data: evalModes } = useQuery({
		...quizQueries.evaluationModes(),
		enabled: open,
	});

	const selectedEvalMode = evalModes?.find(
		m => m.id === (evalModeId ?? evalModes?.[0]?.id)
	);

	const mutation = useStartQuiz(() => onOpenChange(false));

	const isUnlimited = timeStepIndex >= TIME_STEPS.length;
	const timeLimit = isUnlimited ? null : TIME_STEPS[timeStepIndex];

	const handleStart = () => {
		mutation.mutate({
			sectionId,
			questionCount: Math.min(questionCount, maxQuestions),
			timeLimit,
			quizMode: "STUDY",
			evaluationModeId: evalModeId ?? evalModes?.[0]?.id,
		});
	};

	return (
		<SessionDialogShell open={open} onOpenChange={onOpenChange}>
			<SessionDialogColumn
				title="Configura quiz"
				description="Personalizza la sessione di studio"
				submitLabel="Inizia Quiz"
				onSubmit={handleStart}
				onCancel={() => onOpenChange(false)}
				isPending={mutation.isPending}
			>
				<QuizConfigFields
					questionCount={questionCount}
					setQuestionCount={setQuestionCount}
					timeStepIndex={timeStepIndex}
					setTimeStepIndex={setTimeStepIndex}
					evalModeId={evalModeId}
					setEvalModeId={setEvalModeId}
					evalModes={evalModes}
					selectedEvalMode={selectedEvalMode}
					maxQuestions={maxQuestions}
				/>
			</SessionDialogColumn>

			<SummaryPanel footerTip="La sessione si avvia subito e non può essere messa in pausa.">
				<QuizSummary
					timeLimit={timeLimit}
					questionCount={questionCount}
					maxQuestions={maxQuestions}
					selectedEvalMode={selectedEvalMode}
				/>
			</SummaryPanel>
		</SessionDialogShell>
	);
}
