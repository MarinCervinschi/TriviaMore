"use client";

import { AppLayout } from "@/components/layouts/AppLayout";
import { QuizResult } from "@/lib/types/quiz.types";

import { QuizResults } from "./SharedQuizResults";

interface QuizInlineResultsProps {
	results: QuizResult;
	onExit: () => void;
	onRetry?: () => void;
}

export function QuizInlineResults({
	results,
	onExit,
	onRetry,
}: QuizInlineResultsProps) {
	return (
		<AppLayout>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<QuizResults
					results={results}
					onExit={onExit}
					onRetry={onRetry}
					showRetry={true}
				/>
			</div>
		</AppLayout>
	);
}
