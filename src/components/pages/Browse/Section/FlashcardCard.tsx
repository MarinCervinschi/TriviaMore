import { BookOpen, Info, Lock, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { FlashcardSettingsDialog } from "./FlashcardSettingsDialog";

interface FlashcardCardProps {
	sectionName: string;
	totalQuestions: number;
	isUserLoggedIn: boolean;
	onStartFlashcards: () => void;
	isLoading?: boolean;
	// Settings props
	cardCount: number[];
	onCardCountChange: (value: number[]) => void;
	isSettingsOpen: boolean;
	onSettingsOpenChange: (open: boolean) => void;
}

export function FlashcardCard({
	sectionName,
	totalQuestions,
	isUserLoggedIn,
	onStartFlashcards,
	isLoading = false,
	cardCount,
	onCardCountChange,
	isSettingsOpen,
	onSettingsOpenChange,
}: FlashcardCardProps) {
	return (
		<Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-violet-900/20">
			<CardContent className="p-4 sm:p-6">
				<div className="space-y-4">
					<div>
						<div className="mb-2 flex items-center space-x-2">
							<Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Flashcard
								<span className="ml-2 text-base font-normal text-purple-700 dark:text-purple-300">
									({totalQuestions} carte)
								</span>
							</h3>
						</div>
						<p className="text-sm text-gray-700 dark:text-gray-300">
							Studia velocemente con le flashcard interattive. Perfetto per il ripasso e
							la memorizzazione dei concetti chiave. Per il numero di carte consulta le
							impostazioni.
						</p>
					</div>

					<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
						<Button
							onClick={onStartFlashcards}
							disabled={totalQuestions === 0 || isLoading}
							className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 sm:w-auto"
						>
							<BookOpen className="mr-2 h-4 w-4" />
							{isLoading ? "Avvio..." : "Inizia Flashcard"}
						</Button>

						{isUserLoggedIn && (
							<FlashcardSettingsDialog
								isOpen={isSettingsOpen}
								onOpenChange={onSettingsOpenChange}
								sectionName={sectionName}
								totalQuestions={totalQuestions}
								cardCount={cardCount}
								onCardCountChange={onCardCountChange}
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
							<span className="text-center sm:text-left">Carte di studio</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
