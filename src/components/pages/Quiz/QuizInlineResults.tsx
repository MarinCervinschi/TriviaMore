"use client";

import { AppLayout } from "@/components/layouts/AppLayout";

import { QuizResults } from "./SharedQuizResults";

interface QuizAnswer {
	questionId: string;
	answer: string[];
	isCorrect?: boolean;
	score?: number;
}

interface QuizQuestion {
	id: string;
	content: string;
	correctAnswer: string[];
	options?: string[];
}

interface QuizInlineResultsProps {
	results: {
		totalScore: number;
		correctAnswers: number;
		totalQuestions: number;
		timeSpent: number;
		answers: QuizAnswer[];
		evaluationMode: {
			name: string;
			description?: string;
			correctAnswerPoints: number;
			incorrectAnswerPoints: number;
			partialCreditEnabled: boolean;
		};
	};
	questions: QuizQuestion[];
	quizTitle: string;
	onExit: () => void;
	onRetry?: () => void;
}

export function QuizInlineResults({
	results,
	questions,
	quizTitle,
	onExit,
	onRetry,
}: QuizInlineResultsProps) {
	// Mappa i dati nel formato richiesto dal componente condiviso
	const formattedResults = {
		...results,
		answers: results.answers.map(answer => ({
			questionId: answer.questionId,
			userAnswer: answer.answer,
			isCorrect: answer.isCorrect,
			score: answer.score,
		})),
	};

	return (
		<AppLayout>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<QuizResults
					results={formattedResults}
					questions={questions}
					quizTitle={quizTitle}
					onExit={onExit}
					onRetry={onRetry}
					showRetry={true}
				/>
			</div>
		</AppLayout>
	);
}
