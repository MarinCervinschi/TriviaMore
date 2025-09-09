import { ArrowLeft, Award, CheckCircle, RotateCcw, Zap } from "lucide-react";

import { AppLayout } from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlashcardSession } from "@/lib/types/flashcard.types";

interface FlashcardResultsProps {
	session: FlashcardSession;
	studiedCardsCount: number;
	onRestart: () => void;
	onExit: () => void;
}

export function FlashcardResults({
	session,
	studiedCardsCount,
	onRestart,
	onExit,
}: FlashcardResultsProps) {
	const totalCards = session.questions.length;
	const completionPercentage = Math.round((studiedCardsCount / totalCards) * 100);

	const getCompletionMessage = () => {
		if (completionPercentage === 100) {
			return "Eccellente! Hai studiato tutte le carte!";
		} else if (completionPercentage >= 80) {
			return "Ottimo lavoro! Hai coperto la maggior parte del materiale.";
		} else if (completionPercentage >= 60) {
			return "Buon progresso! Continua così.";
		} else {
			return "Buon inizio! C'è ancora materiale da rivedere.";
		}
	};

	const getCompletionColor = () => {
		if (completionPercentage === 100) {return "text-green-600 dark:text-green-400";}
		if (completionPercentage >= 80) {return "text-blue-600 dark:text-blue-400";}
		if (completionPercentage >= 60) {return "text-yellow-600 dark:text-yellow-400";}
		return "text-purple-600 dark:text-purple-400";
	};

	return (
		<AppLayout>
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-violet-50 p-4 dark:from-purple-900/10 dark:via-gray-900 dark:to-violet-900/10">
				<Card className="w-full max-w-2xl border-purple-200 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-purple-700 dark:bg-gray-900/80">
					<CardContent className="p-8">
						<div className="space-y-6 text-center">
							{/* Icona e titolo */}
							<div className="space-y-4">
								<div className="flex justify-center">
									{completionPercentage === 100 ? (
										<div className="rounded-full bg-green-100 p-6 dark:bg-green-900/50">
											<Award className="h-16 w-16 text-green-600 dark:text-green-400" />
										</div>
									) : (
										<div className="rounded-full bg-purple-100 p-6 dark:bg-purple-900/50">
											<Zap className="h-16 w-16 text-purple-600 dark:text-purple-400" />
										</div>
									)}
								</div>

								<div>
									<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
										Sessione Completata!
									</h1>
									<p className={`text-lg ${getCompletionColor()}`}>
										{getCompletionMessage()}
									</p>
								</div>
							</div>

							{/* Statistiche */}
							<div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
								<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									Riepilogo Studio
								</h3>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div className="text-center">
										<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
											{studiedCardsCount}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-300">
											Carte studiate
										</div>
									</div>

									<div className="text-center">
										<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
											{totalCards}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-300">
											Carte totali
										</div>
									</div>

									<div className="text-center">
										<div className={`text-3xl font-bold ${getCompletionColor()}`}>
											{completionPercentage}%
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-300">
											Completamento
										</div>
									</div>
								</div>
							</div>

							{/* Informazioni sulla sezione */}
							<div className="rounded-2xl bg-purple-50 p-6 dark:bg-purple-900/20">
								<div className="mb-3 flex items-center justify-center space-x-3">
									<CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										{session.section.name}
									</h3>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-300">
									{session.section.class.course.name} - {session.section.class.name}
								</p>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{session.section.class.course.department.name}
								</p>
							</div>

							{/* Azioni */}
							<div className="flex flex-col gap-4 pt-4 sm:flex-row">
								<Button
									variant="outline"
									size="lg"
									onClick={onExit}
									className="flex-1 border-purple-200 bg-white/80 backdrop-blur-sm hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-900/80 dark:hover:bg-purple-900/50"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Torna alla Sezione
								</Button>

								<Button
									size="lg"
									onClick={onRestart}
									className="flex-1 bg-purple-600 text-white shadow-lg hover:bg-purple-700"
								>
									<RotateCcw className="mr-2 h-4 w-4" />
									Ricomincia
								</Button>
							</div>

							{/* Suggerimento */}
							{completionPercentage < 100 && (
								<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
									<p className="text-sm text-yellow-800 dark:text-yellow-200">
										💡 <strong>Suggerimento:</strong> Prova a rivedere le carte che non
										hai ancora studiato per migliorare la tua preparazione!
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
