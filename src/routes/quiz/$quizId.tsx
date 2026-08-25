import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	notFound,
	useBlocker,
	useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";

import { NotFoundPage } from "@/components/error/not-found-page";
import { PageBand } from "@/components/layout/page-band";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuizHeader } from "@/components/quiz/quiz-header";
import { QuizNavigation } from "@/components/quiz/quiz-navigation";
import { QuizProgress } from "@/components/quiz/quiz-progress";
import { QuizSidebar, QuizSidebarContent } from "@/components/quiz/quiz-sidebar";
import { QuizPlaySkeleton } from "@/components/skeletons";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cancelQuizFn, completeQuizFn } from "@/lib/quiz/api";
import { quizQueries } from "@/lib/quiz/queries";
import type { Quiz, UserAnswer } from "@/lib/quiz/types";

export const Route = createFileRoute("/quiz/$quizId")({
	loader: async ({ context, params }) => {
		const quiz = await context.queryClient.ensureQueryData(
			quizQueries.quiz(params.quizId)
		);
		if (!quiz) throw notFound();
		return quiz;
	},
	pendingComponent: QuizPlaySkeleton,
	component: QuizPage,
	// This route lives outside the app shell, so the not-found page brings its
	// own band.
	notFoundComponent: () => (
		<NotFoundPage
			title="Quiz non disponibile"
			message="Questo quiz non esiste più: potresti averlo chiuso o annullato."
		/>
	),
});

function QuizPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const quiz = Route.useLoaderData() as Quiz;

	const [currentIndex, setCurrentIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
	const [startTime] = useState(Date.now());
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);
	const isCompletingRef = useRef(false);
	const isExitingRef = useRef(false);

	// Leaving any other way — the back arrow, a nav link — used to abandon the
	// attempt: it stayed open forever, holding a quiz nobody could reach. Route it
	// through the same confirmation the Esci button uses, so the attempt is either
	// finished or cancelled. `enableBeforeUnload` covers closing the tab, where the
	// browser only lets us warn.
	const blocker = useBlocker({
		shouldBlockFn: () => !isCompletingRef.current && !isExitingRef.current,
		enableBeforeUnload: () => !isCompletingRef.current && !isExitingRef.current,
		disabled: !quiz?.attemptId,
		withResolver: true,
	});

	useEffect(() => {
		if (blocker.status === "blocked") setShowExitDialog(true);
	}, [blocker.status]);

	// Initialize answers when quiz loads
	useEffect(() => {
		if (quiz) {
			setUserAnswers(
				quiz.questions.map(q => ({
					questionId: q.id,
					answer: [],
				}))
			);
		}
	}, [quiz]);

	const handleAnswerChange = useCallback((questionId: string, answer: string[]) => {
		setUserAnswers(prev =>
			prev.map(ua => (ua.questionId === questionId ? { ...ua, answer } : ua))
		);
	}, []);

	const handleComplete = useCallback(async () => {
		if (!quiz || !quiz.attemptId) return;
		if (isCompletingRef.current) return;
		isCompletingRef.current = true;
		setIsCompleting(true);

		try {
			const { attemptId } = await completeQuizFn({
				data: {
					quizAttemptId: quiz.attemptId,
					answers: userAnswers.map(ua => ({
						questionId: ua.questionId,
						userAnswer: ua.answer,
					})),
					timeSpent: Date.now() - startTime,
				},
			});
			// Invalidate user data caches so dashboard shows updated stats
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate({
				to: "/quiz/results/$attemptId",
				params: { attemptId },
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Non è stato possibile completare il quiz."
			);
			isCompletingRef.current = false;
			setIsCompleting(false);
		}
	}, [quiz, userAnswers, startTime, navigate, queryClient]);

	const confirmExit = useCallback(async () => {
		isExitingRef.current = true;
		if (quiz?.attemptId) {
			try {
				await cancelQuizFn({ data: { quizAttemptId: quiz.attemptId } });
			} catch {
				// Ignore cancel errors
			}
		}
		if (blocker.status === "blocked") blocker.proceed();
		else navigate({ to: "/" });
	}, [quiz, navigate, blocker]);

	// Radix closes the dialog on confirm too, so the exit flag is what tells the
	// two apart: dismissing means staying and releases the blocked navigation,
	// confirming must leave it alone for `confirmExit` to proceed with.
	const closeExitDialog = useCallback(
		(open: boolean) => {
			setShowExitDialog(open);
			if (!open && !isExitingRef.current && blocker.status === "blocked") {
				blocker.reset();
			}
		},
		[blocker]
	);

	const handleJump = useCallback((index: number) => {
		setCurrentIndex(index);
		if (typeof window !== "undefined" && window.innerWidth < 1024) {
			setMobileSidebarOpen(false);
		}
	}, []);

	const toggleSidebar = useCallback(() => {
		if (typeof window !== "undefined" && window.innerWidth >= 1024) {
			setSidebarOpen(prev => !prev);
		} else {
			setMobileSidebarOpen(prev => !prev);
		}
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight" && currentIndex < (quiz?.questions.length ?? 0) - 1) {
				setCurrentIndex(prev => prev + 1);
			} else if (e.key === "ArrowLeft" && currentIndex > 0) {
				setCurrentIndex(prev => prev - 1);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex, quiz?.questions.length]);

	const currentQuestion = quiz.questions[currentIndex];
	const currentAnswers =
		userAnswers.find(ua => ua.questionId === currentQuestion?.id)?.answer ?? [];
	const answeredQuestions = quiz.questions.map(q => {
		const ua = userAnswers.find(ua => ua.questionId === q.id);
		return (ua?.answer.length ?? 0) > 0;
	});

	return (
		<div className="relative isolate flex h-dvh flex-col">
			<PageBand />
			<QuizHeader
				questionIndex={currentIndex}
				totalQuestions={quiz.questions.length}
				timeLimit={quiz.timeLimit}
				sidebarOpen={sidebarOpen}
				onToggleSidebar={toggleSidebar}
				onTimeUp={handleComplete}
				onExit={() => setShowExitDialog(true)}
			/>
			<div className="flex flex-1 overflow-hidden">
				{sidebarOpen && (
					<QuizSidebar
						totalQuestions={quiz.questions.length}
						currentIndex={currentIndex}
						answeredQuestions={answeredQuestions}
						onJump={handleJump}
					/>
				)}
				<Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
					<SheetContent side="left" className="w-72 overflow-y-auto p-4 lg:hidden">
						<QuizSidebarContent
							totalQuestions={quiz.questions.length}
							currentIndex={currentIndex}
							answeredQuestions={answeredQuestions}
							onJump={handleJump}
						/>
					</SheetContent>
				</Sheet>
				<div className="flex flex-1 flex-col overflow-hidden">
					<QuizProgress current={currentIndex} total={quiz.questions.length} />
					<div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
						{currentQuestion && (
							<QuestionCard
								question={currentQuestion}
								questionNumber={currentIndex + 1}
								selectedAnswers={currentAnswers}
								onAnswerChange={answers =>
									handleAnswerChange(currentQuestion.id, answers)
								}
							/>
						)}
					</div>
				</div>
			</div>
			<QuizNavigation
				currentIndex={currentIndex}
				totalQuestions={quiz.questions.length}
				onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
				onNext={() =>
					setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))
				}
				onComplete={handleComplete}
				isCompleting={isCompleting}
			/>
			<ConfirmationDialog
				open={showExitDialog}
				onOpenChange={closeExitDialog}
				title="Uscire dal quiz?"
				description="Il quiz verrà eliminato e i progressi andranno persi."
				confirmText="Esci"
				cancelText="Continua"
				variant="destructive"
				onConfirm={confirmExit}
			/>
		</div>
	);
}
