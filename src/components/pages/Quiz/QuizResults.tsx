"use client";

import { useRouter } from "next/navigation";

import { QuizResult } from "@/lib/types/quiz.types";

import { QuizResults } from "./SharedQuizResults";

export default function QuizResultsPageComponent({ results }: { results: QuizResult }) {
	const router = useRouter();

	const handleBackToUser = () => {
		router.push("/user");
	};

	const handleRetryQuiz = () => {
		router.push(`/quiz/${results.quizId}`);
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<QuizResults
				results={results}
				onExit={handleBackToUser}
				onRetry={handleRetryQuiz}
				showRetry={true}
			/>
		</div>
	);
}
