import { Brain, Info, Lock, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { QuizSettingsDialog } from "./QuizSettingsDialog";

interface EvaluationMode {
	id: string;
	name: string;
	description?: string | null;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

interface QuizCardProps {
	sectionName: string;
	totalQuestions: number;
	isUserLoggedIn: boolean;
	onStartQuiz: () => void;
	isLoading?: boolean;
	// Settings props
	questionCount: number[];
	onQuestionCountChange: (value: number[]) => void;
	timeLimit: number[];
	onTimeLimitChange: (value: number[]) => void;
	evaluationModes: EvaluationMode[];
	selectedEvaluationMode: string;
	onEvaluationModeChange: (value: string) => void;
	isSettingsOpen: boolean;
	onSettingsOpenChange: (open: boolean) => void;
}

export function QuizCard({
	sectionName,
	totalQuestions,
	isUserLoggedIn,
	onStartQuiz,
	isLoading = false,
	questionCount,
	onQuestionCountChange,
	timeLimit,
	onTimeLimitChange,
	evaluationModes,
	selectedEvaluationMode,
	onEvaluationModeChange,
	isSettingsOpen,
	onSettingsOpenChange,
}: QuizCardProps) {
	return (
		<Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
			<CardContent className="p-4 sm:p-6">
				<div className="space-y-4">
					<div>
						<div className="mb-2 flex items-center space-x-2">
							<Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Tenta Quiz
							</h3>
						</div>
						<p className="text-sm text-gray-700 dark:text-gray-300">
							Mettiti alla prova su questa sezione e rispondi alle domande. Non c&apos;è
							solo una risposta corretta! Per modalità di valutazione consulta le
							impostazioni. Di default ogni domanda vale 1 punto e non ci sono penalità.{" "}
							{totalQuestions > 0 ? (
								<>
									Sono disponibili <span className="font-medium">{totalQuestions}</span>{" "}
									domande per <span className="font-medium">{sectionName}</span>.
								</>
							) : (
								"Non ci sono ancora domande disponibili per questa sezione."
							)}
						</p>
					</div>

					<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
						<Button
							onClick={onStartQuiz}
							disabled={totalQuestions === 0 || isLoading}
							className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 sm:w-auto"
						>
							<Play className="mr-2 h-4 w-4" />
							{isLoading ? "Avvio Quiz..." : "Inizia Quiz"}
						</Button>

						{isUserLoggedIn && (
							<QuizSettingsDialog
								isOpen={isSettingsOpen}
								onOpenChange={onSettingsOpenChange}
								sectionName={sectionName}
								totalQuestions={totalQuestions}
								questionCount={questionCount}
								onQuestionCountChange={onQuestionCountChange}
								timeLimit={timeLimit}
								onTimeLimitChange={onTimeLimitChange}
								evaluationModes={evaluationModes}
								selectedEvaluationMode={selectedEvaluationMode}
								onEvaluationModeChange={onEvaluationModeChange}
							/>
						)}

						{!isUserLoggedIn && (
							<div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
								<Lock className="h-3 w-3 flex-shrink-0" />
								<span>Accedi per personalizzare le impostazioni</span>
							</div>
						)}

						<div className="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400 sm:justify-start">
							<Info className="h-3 w-3 flex-shrink-0" />
							<span className="text-center sm:text-left">Quiz della sezione</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
