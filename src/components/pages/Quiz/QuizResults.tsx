"use client";

import { useRouter } from "next/navigation";

import { QuizResults } from "./SharedQuizResults";

interface QuizAttemptResults {
	id: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	timeSpent: number;
	quiz: {
		id: string;
		title: string;
		description: string;
		section: {
			name: string;
			class: {
				name: string;
				course: {
					name: string;
				};
			};
		};
		questions: Array<{
			id: string;
			content: string;
			options: string[];
			correctAnswer: string[];
		}>;
		evaluationMode: {
			name: string;
			description?: string;
			correctAnswerPoints: number;
			incorrectAnswerPoints: number;
			partialCreditEnabled: boolean;
		};
	};
	answers: Array<{
		questionId: string;
		userAnswer: string[];
		isCorrect: boolean;
		score: number;
		question: {
			content: string;
			correctAnswer: string[];
		};
	}>;
}

export default function QuizResultsPageComponent({
	results,
}: {
	results: QuizAttemptResults;
}) {
	const router = useRouter();

	const handleBackToDashboard = () => {
		router.back();
	};

	const handleRetryQuiz = () => {
		router.push(`/quiz/${results.quiz.id}`);
	};

	const formattedResults = {
		totalScore: results.score,
		correctAnswers: results.correctAnswers,
		totalQuestions: results.totalQuestions,
		timeSpent: results.timeSpent,
		evaluationMode: results.quiz.evaluationMode,
		answers: results.answers.map(answer => ({
			questionId: answer.questionId,
			userAnswer: answer.userAnswer,
			isCorrect: answer.isCorrect,
			score: answer.score,
		})),
	};

	const quizTitle = results.quiz.title || results.quiz.section.name;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<QuizResults
				results={formattedResults}
				questions={results.quiz.questions}
				quizTitle={quizTitle}
				onExit={handleBackToDashboard}
				onRetry={handleRetryQuiz}
				showRetry={true}
			/>
		</div>
	);
}
