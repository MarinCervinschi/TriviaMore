"use client";

import { useState } from "react";

import { Quiz } from "@/lib/types/quiz.types";

import { QuestionCard } from "./QuestionCard";
import { QuizHeader } from "./QuizHeader";
import { QuizInlineResults } from "./QuizInlineResults";
import { QuizNavigation } from "./QuizNavigation";
import { QuizProgress } from "./QuizProgress";
import { QuizSidebar } from "./QuizSidebar";

interface UserAnswer {
	questionId: string;
	answer: string[];
	isCorrect?: boolean;
	score?: number;
}

interface QuizContainerProps {
	quiz: Quiz;
	isGuest: boolean;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
	onComplete: (results: any) => void;
	onExit: () => void;
}

export function QuizContainer({
	quiz,
	isGuest,
	user,
	onComplete,
	onExit,
}: QuizContainerProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(() => {
		return quiz.questions.map(q => ({
			questionId: q.id,
			answer: [],
		}));
	});
	const [startTime, setStartTime] = useState(Date.now());
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [showResults, setShowResults] = useState(false);

	const currentQuestion = quiz.questions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
	const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

	const handleAnswerChange = (questionId: string, answer: string[]) => {
		setUserAnswers(prev =>
			prev.map(ua => (ua.questionId === questionId ? { ...ua, answer } : ua))
		);
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex(prev => prev + 1);
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(prev => prev - 1);
		}
	};

	const handleQuestionJump = (index: number) => {
		setCurrentQuestionIndex(index);
		const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
		if (isMobile) {
			setSidebarOpen(false);
		}
	};

	const calculateResults = () => {
		let totalScore = 0;
		let correctAnswers = 0;

		const answersWithResults = userAnswers.map(userAnswer => {
			const question = quiz.questions.find(q => q.id === userAnswer.questionId);
			if (!question) return userAnswer;

			let score = 0;
			let isFullyCorrect = false;

			if (userAnswer.answer.length === 0) {
				score = 0;
				isFullyCorrect = false;
			} else {
				const correctGiven = userAnswer.answer.filter(ans =>
					question.correctAnswer.includes(ans)
				).length;
				const incorrectGiven = userAnswer.answer.filter(
					ans => !question.correctAnswer.includes(ans)
				).length;
				const totalCorrect = question.correctAnswer.length;
				const totalGiven = userAnswer.answer.length;

				if (
					correctGiven === totalCorrect &&
					incorrectGiven === 0 &&
					totalGiven === totalCorrect
				) {
					score = quiz.evaluationMode.correctAnswerPoints;
					isFullyCorrect = true;
					correctAnswers++;
				} else if (correctGiven > 0) {
					if (quiz.evaluationMode.partialCreditEnabled) {
						const correctnessRatio = correctGiven / totalCorrect;
						const penaltyRatio = incorrectGiven / Math.max(totalGiven, 1);
						const adjustedRatio = Math.max(0, correctnessRatio - penaltyRatio);
						score = Math.round(quiz.evaluationMode.correctAnswerPoints * adjustedRatio);

						if (incorrectGiven > 0) {
							const penalty =
								incorrectGiven * Math.abs(quiz.evaluationMode.incorrectAnswerPoints);
							score = Math.max(
								score - penalty,
								quiz.evaluationMode.incorrectAnswerPoints
							);
						}
					} else {
						score = 0;
					}
					isFullyCorrect = false;
				} else {
					score = quiz.evaluationMode.incorrectAnswerPoints;
					isFullyCorrect = false;
				}
			}

			totalScore += score;

			return {
				...userAnswer,
				isCorrect: isFullyCorrect,
				score,
			};
		});

		return {
			totalScore,
			correctAnswers,
			totalQuestions: quiz.questions.length,
			timeSpent: Date.now() - startTime,
			answers: answersWithResults,
			evaluationMode: quiz.evaluationMode,
		};
	};

	const handleCompleteQuiz = () => {
		const results = calculateResults();
		setShowResults(true);
		onComplete(results);
	};

	const handleTimeUp = () => {
		handleCompleteQuiz();
	};

	const getCurrentAnswer = (questionId: string): string[] => {
		const userAnswer = userAnswers.find(ua => ua.questionId === questionId);
		return userAnswer?.answer || [];
	};

	const getAnsweredQuestions = (): boolean[] => {
		return quiz.questions.map(q => {
			const userAnswer = userAnswers.find(ua => ua.questionId === q.id);
			return (userAnswer?.answer.length || 0) > 0;
		});
	};

	if (showResults) {
		if (isGuest) {
			return (
				<QuizInlineResults
					results={calculateResults()}
					questions={quiz.questions}
					quizTitle={`Quiz: ${quiz.section.name}`}
					onExit={onExit}
					onRetry={() => {
						setCurrentQuestionIndex(0);
						const initialAnswers: UserAnswer[] = quiz.questions.map(q => ({
							questionId: q.id,
							answer: [],
						}));
						setUserAnswers(initialAnswers);
						setStartTime(Date.now());
						setShowResults(false);
					}}
				/>
			);
		}

		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-green-600 dark:text-green-400">
						Quiz Completato!
					</h1>
					<p className="text-gray-700 dark:text-gray-300">
						Reindirizzamento ai risultati...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Sidebar per desktop */}
			<QuizSidebar
				questions={quiz.questions}
				answeredQuestions={getAnsweredQuestions()}
				currentQuestionIndex={currentQuestionIndex}
				onQuestionSelect={handleQuestionJump}
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
			/>

			{/* Contenuto principale */}
			<div className="flex flex-1 flex-col">
				{/* Header */}
				<QuizHeader
					quiz={quiz}
					isGuest={isGuest}
					user={user}
					onExit={onExit}
					onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
					onTimeUp={handleTimeUp}
					sidebarOpen={sidebarOpen}
					key={`quiz-header-${startTime}`}
				/>

				{/* Progress */}
				<QuizProgress
					current={currentQuestionIndex + 1}
					total={quiz.questions.length}
					progress={progress}
				/>

				{/* Domanda */}
				<div className="flex-1 p-4 sm:p-6">
					<div className="mx-auto max-w-4xl">
						<QuestionCard
							question={currentQuestion}
							questionNumber={currentQuestionIndex + 1}
							totalQuestions={quiz.questions.length}
							selectedAnswers={getCurrentAnswer(currentQuestion.id)}
							onAnswerChange={(answer: string[]) =>
								handleAnswerChange(currentQuestion.id, answer)
							}
						/>
					</div>
				</div>

				{/* Navigation */}
				<QuizNavigation
					currentIndex={currentQuestionIndex}
					totalQuestions={quiz.questions.length}
					isLastQuestion={isLastQuestion}
					onPrevious={handlePreviousQuestion}
					onNext={handleNextQuestion}
					onComplete={handleCompleteQuiz}
				/>
			</div>
		</div>
	);
}
