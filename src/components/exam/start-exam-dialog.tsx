import { useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { useQuery } from "@tanstack/react-query";

import { Spinner } from "@/components/icons";
import { AnimatedStack } from "@/components/session-config/animated-block";
import {
	FlashcardConfigFields,
	FlashcardSummary,
} from "@/components/session-config/flashcard-config";
import { QuizConfigFields, QuizSummary } from "@/components/session-config/quiz-config";
import { SessionDialogShell } from "@/components/session-config/session-dialog";
import { SummaryPanel } from "@/components/session-config/summary-panel";
import { Button } from "@/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStartExamFlashcard } from "@/lib/flashcard/mutations";
import { TIME_STEPS } from "@/lib/quiz/constants";
import { useStartQuiz } from "@/lib/quiz/mutations";
import { quizQueries } from "@/lib/quiz/queries";
import { sessionCap } from "@/lib/shared/session";

type ExamTab = "quiz" | "flashcard";

export function StartExamDialog({
	open,
	onOpenChange,
	sectionId,
	maxQuizQuestions,
	maxFlashcardQuestions,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sectionId: string;
	maxQuizQuestions: number;
	maxFlashcardQuestions: number;
}) {
	const hasQuiz = maxQuizQuestions > 0;
	const hasFlashcard = maxFlashcardQuestions > 0;
	const [tab, setTab] = useState<ExamTab>(hasQuiz ? "quiz" : "flashcard");

	// Quiz state
	const quizCap = sessionCap(maxQuizQuestions);
	const cardCap = sessionCap(maxFlashcardQuestions);
	const [questionCount, setQuestionCount] = useState(
		Math.min(33, Math.max(1, quizCap))
	);
	const [timeStepIndex, setTimeStepIndex] = useState(TIME_STEPS.indexOf(60));
	const [evalModeId, setEvalModeId] = useState<string | undefined>();

	// Flashcard state
	const [cardCount, setCardCount] = useState(Math.min(20, Math.max(1, cardCap)));

	const { data: evalModes } = useQuery({
		...quizQueries.evaluationModes(),
		enabled: open && hasQuiz,
	});

	const selectedEvalMode = evalModes?.find(
		m => m.id === (evalModeId ?? evalModes?.[0]?.id)
	);

	const quizMutation = useStartQuiz(() => onOpenChange(false));
	const flashcardMutation = useStartExamFlashcard(() => onOpenChange(false));
	const loading = quizMutation.isPending || flashcardMutation.isPending;

	const isUnlimited = timeStepIndex >= TIME_STEPS.length;
	const timeLimit = isUnlimited ? null : TIME_STEPS[timeStepIndex];

	const handleStartQuiz = () => {
		quizMutation.mutate({
			sectionId,
			questionCount: Math.min(questionCount, quizCap),
			timeLimit,
			quizMode: "EXAM_SIMULATION",
			evaluationModeId: evalModeId ?? evalModes?.[0]?.id,
		});
	};

	const handleStartFlashcard = () => {
		flashcardMutation.mutate({
			sectionId,
			cardCount: Math.min(cardCount, cardCap),
		});
	};

	const quizFields = (
		<QuizConfigFields
			questionCount={questionCount}
			setQuestionCount={setQuestionCount}
			timeStepIndex={timeStepIndex}
			setTimeStepIndex={setTimeStepIndex}
			evalModeId={evalModeId}
			setEvalModeId={setEvalModeId}
			evalModes={evalModes}
			selectedEvalMode={selectedEvalMode}
			maxQuestions={quizCap}
			available={maxQuizQuestions}
		/>
	);
	const flashcardFields = (
		<FlashcardConfigFields
			cardCount={cardCount}
			setCardCount={setCardCount}
			maxCards={cardCap}
			available={maxFlashcardQuestions}
		/>
	);

	const showTabs = hasQuiz && hasFlashcard;

	return (
		<SessionDialogShell open={open} onOpenChange={onOpenChange}>
			<div className="flex flex-col">
				<DialogHeader className="border-b px-6 pt-5 pb-4 text-left">
					<DialogTitle>Simulazione esame</DialogTitle>
					<DialogDescription>
						Domande da tutte le sezioni dell&apos;insegnamento
					</DialogDescription>
				</DialogHeader>

				{showTabs ? (
					<Tabs
						value={tab}
						onValueChange={v => setTab(v as ExamTab)}
						className="flex flex-1 flex-col"
					>
						<div className="px-6 pt-4">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger
									value="quiz"
									className="gap-1.5 focus-visible:shadow-none focus-visible:ring-offset-0"
								>
									<BookIcon className="h-3.5 w-3.5" />
									Quiz
								</TabsTrigger>
								<TabsTrigger
									value="flashcard"
									className="gap-1.5 focus-visible:shadow-none focus-visible:ring-offset-0"
								>
									<StarsIcon className="h-3.5 w-3.5" />
									Flashcard
								</TabsTrigger>
							</TabsList>
						</div>
						<TabsContent value="quiz" className="m-0 px-6 py-5">
							<AnimatedStack className="flex flex-col gap-5">
								{quizFields}
							</AnimatedStack>
						</TabsContent>
						<TabsContent value="flashcard" className="m-0 px-6 py-5">
							<AnimatedStack className="flex flex-col gap-5">
								{flashcardFields}
							</AnimatedStack>
						</TabsContent>
					</Tabs>
				) : (
					<AnimatedStack className="flex flex-col gap-5 px-6 py-5">
						{hasQuiz ? quizFields : flashcardFields}
					</AnimatedStack>
				)}

				<DialogFooter className="mt-auto flex justify-end gap-2 border-t px-6 py-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Annulla
					</Button>
					<Button
						onClick={tab === "quiz" ? handleStartQuiz : handleStartFlashcard}
						disabled={loading}
					>
						{loading && <Spinner className="mr-2" />}
						{tab === "quiz" ? "Inizia Quiz" : "Inizia Flashcard"}
					</Button>
				</DialogFooter>
			</div>

			<SummaryPanel footerTip="Simulazione esame · raccoglie da tutte le sezioni del corso.">
				{tab === "quiz" ? (
					<QuizSummary
						timeLimit={timeLimit}
						questionCount={questionCount}
						maxQuestions={maxQuizQuestions}
						selectedEvalMode={selectedEvalMode}
					/>
				) : (
					<FlashcardSummary cardCount={cardCount} maxCards={maxFlashcardQuestions} />
				)}
			</SummaryPanel>
		</SessionDialogShell>
	);
}
