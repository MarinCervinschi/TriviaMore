"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Book, Info, Lock, Play, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlashcardMutations, useQuizMutations } from "@/hooks";

interface EvaluationMode {
	id: string;
	name: string;
	description?: string | null;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

interface ClassData {
	id: string;
	name: string;
	sections: {
		_count: {
			questions: number;
			quizQuestions: number;
			flashcardQuestions: number;
		};
	}[];
}

interface ExamSimulationButtonProps {
	classData: ClassData;
	evaluationModes: EvaluationMode[];
}

export default function ExamSimulationButton({
	classData,
	evaluationModes,
}: ExamSimulationButtonProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const { startQuiz, isLoading: isQuizLoading } = useQuizMutations(session?.user.id);
	const { startExamSimulation, isLoading: isFlashcardLoading } =
		useFlashcardMutations();

	const isUserLoggedIn = !!session;

	const totalQuizQuestions = classData.sections.reduce(
		(acc, section) => acc + section._count.quizQuestions,
		0
	);

	const totalFlashcardQuestions = classData.sections.reduce(
		(acc, section) => acc + section._count.flashcardQuestions,
		0
	);

	// Stati per quiz
	const defaultQuestionCount = Math.min(30, totalQuizQuestions);
	const [questionCount, setQuestionCount] = useState([defaultQuestionCount]);
	const [selectedEvaluationMode, setSelectedEvaluationMode] = useState(
		evaluationModes.length > 0 ? evaluationModes[0].id : ""
	);
	const [timerMinutes, setTimerMinutes] = useState([60]); // Default 60 minuti

	// Stati per flashcard
	const defaultFlashcardCount = Math.min(20, totalFlashcardQuestions);
	const [flashcardCount, setFlashcardCount] = useState([defaultFlashcardCount]);

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [currentTab, setCurrentTab] = useState("quiz");

	const isLoading = isQuizLoading || isFlashcardLoading;

	// Verifica se ci sono abbastanza domande per la modalità selezionata
	const hasEnoughQuestions =
		currentTab === "quiz" ? totalQuizQuestions > 0 : totalFlashcardQuestions > 0;

	const isButtonDisabled = !hasEnoughQuestions || isLoading;

	const handleStartExam = async () => {
		if (!isUserLoggedIn) {
			router.push("/auth/login");
			return;
		}

		if (currentTab === "quiz") {
			const quizParams = {
				sectionId: classData.id,
				questionCount: questionCount[0],
				timeLimit: timerMinutes[0],
				quizMode: "EXAM_SIMULATION" as const,
				evaluationModeId: selectedEvaluationMode,
			};

			await startQuiz.mutateAsync(quizParams);
		} else {
			const flashcardParams = {
				classId: classData.id,
				cardCount: flashcardCount[0],
			};

			await startExamSimulation.mutateAsync(flashcardParams);
		}
	};

	const handleLoginPrompt = () => {
		router.push("/auth/login");
	};

	return (
		<div className="mb-8">
			<Card className="border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
				<CardContent className="p-4 sm:p-6">
					<div className="space-y-4">
						<div>
							<div className="mb-2 flex items-center space-x-2">
								<Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
									Simula Esame
								</h3>
							</div>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								{currentTab === "quiz" ? (
									totalQuizQuestions > 0 ? (
										<>
											Sono disponibili{" "}
											<span className="font-medium">{totalQuizQuestions}</span> domande
											per il quiz (scelta multipla e vero/falso).
										</>
									) : (
										"Non ci sono domande per quiz disponibili (scelta multipla e vero/falso)."
									)
								) : totalFlashcardQuestions > 0 ? (
									<>
										Sono disponibili{" "}
										<span className="font-medium">{totalFlashcardQuestions}</span>{" "}
										domande per le flashcard (risposta aperta).
									</>
								) : (
									"Non ci sono domande per flashcard disponibili (risposta aperta)."
								)}
							</p>
						</div>

						{!isUserLoggedIn && (
							<div className="flex items-start space-x-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
								<Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-orange-800 dark:text-orange-200">
										Accesso richiesto
									</p>
									<p className="text-xs text-orange-700 dark:text-orange-300">
										Devi essere registrato per utilizzare la simulazione d&apos;esame.
									</p>
								</div>
							</div>
						)}

						{/* Tabs per scegliere tra Quiz e Flashcard */}
						{isUserLoggedIn && (
							<Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="quiz" className="flex items-center space-x-2">
										<Play className="h-4 w-4" />
										<span>Quiz</span>
									</TabsTrigger>
									<TabsTrigger
										value="flashcard"
										className="flex items-center space-x-2"
									>
										<Book className="h-4 w-4" />
										<span>Flashcard</span>
									</TabsTrigger>
								</TabsList>

								<TabsContent value="quiz" className="mt-4">
									<div className="space-y-3 rounded-lg border p-4">
										<div className="flex items-center space-x-2">
											<Play className="h-4 w-4 text-blue-600" />
											<span className="text-sm font-medium">Simulazione Quiz</span>
										</div>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											Quiz tradizionale con domande a scelta multipla, vero/falso e
											risposta aperta. Include timer e valutazione.
										</p>
									</div>
								</TabsContent>

								<TabsContent value="flashcard" className="mt-4">
									<div className="space-y-3 rounded-lg border p-4">
										<div className="flex items-center space-x-2">
											<Book className="h-4 w-4 text-green-600" />
											<span className="text-sm font-medium">Simulazione Flashcard</span>
										</div>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											Studio interattivo con carte che mostrano domande e risposte.
											Perfetto per memorizzazione e ripasso.
										</p>
									</div>
								</TabsContent>
							</Tabs>
						)}

						<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
							{isUserLoggedIn ? (
								<>
									<Button
										onClick={handleStartExam}
										disabled={isButtonDisabled}
										className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 sm:w-auto"
									>
										{isLoading ? (
											<>
												<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
												Avvio...
											</>
										) : (
											<>
												{currentTab === "quiz" ? (
													<Play className="mr-2 h-4 w-4" />
												) : (
													<Book className="mr-2 h-4 w-4" />
												)}
												Inizia {currentTab === "quiz" ? "Quiz" : "Flashcard"}
											</>
										)}
									</Button>

									<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm" className="w-full sm:w-auto">
												<Settings className="mr-2 h-4 w-4" />
												Impostazioni
											</Button>
										</DialogTrigger>
										<DialogContent className="mx-4 max-w-sm sm:mx-auto sm:max-w-lg">
											<DialogHeader>
												<DialogTitle>
													Impostazioni {currentTab === "quiz" ? "Quiz" : "Flashcard"}
												</DialogTitle>
												<DialogDescription>
													Personalizza la tua simulazione d&apos;esame per{" "}
													{classData.name}.
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-6 py-4 sm:space-y-8 sm:py-6">
												{currentTab === "quiz" ? (
													<>
														<div className="space-y-4">
															<Label
																htmlFor="question-count"
																className="text-sm font-medium"
															>
																Numero di domande: {questionCount[0]}
															</Label>
															<div className="px-3">
																<Slider
																	id="question-count"
																	min={Math.min(5, totalQuizQuestions)}
																	max={Math.min(totalQuizQuestions, 100)}
																	step={1}
																	value={questionCount}
																	onValueChange={setQuestionCount}
																	className="w-full"
																/>
															</div>
															<p className="text-xs text-gray-500 dark:text-gray-400">
																Da {Math.min(5, totalQuizQuestions)} a{" "}
																{Math.min(totalQuizQuestions, 100)} domande
															</p>
														</div>

														<div className="space-y-3">
															<Label
																htmlFor="evaluation-mode"
																className="text-sm font-medium"
															>
																Modalità di correzione
															</Label>
															<Select
																value={selectedEvaluationMode}
																onValueChange={setSelectedEvaluationMode}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Seleziona modalità">
																		{selectedEvaluationMode && (
																			<span className="truncate">
																				{
																					evaluationModes.find(
																						mode => mode.id === selectedEvaluationMode
																					)?.name
																				}
																			</span>
																		)}
																	</SelectValue>
																</SelectTrigger>
																<SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
																	{evaluationModes.map(mode => (
																		<SelectItem key={mode.id} value={mode.id}>
																			<div className="w-full py-1">
																				<div className="truncate font-medium">
																					{mode.name}
																				</div>
																				{mode.description && (
																					<div className="mt-1 text-xs text-gray-500">
																						{mode.description}
																					</div>
																				)}
																			</div>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>

														<div className="space-y-4">
															<Label
																htmlFor="timer-minutes"
																className="text-sm font-medium"
															>
																Tempo limite: {timerMinutes[0]} minuti
															</Label>
															<div className="px-3">
																<Slider
																	id="timer-minutes"
																	min={10}
																	max={120}
																	step={5}
																	value={timerMinutes}
																	onValueChange={setTimerMinutes}
																	className="w-full"
																/>
															</div>
															<p className="text-xs text-gray-500 dark:text-gray-400">
																Da 10 a 120 minuti
															</p>
														</div>
													</>
												) : (
													<>
														<div className="space-y-4">
															<Label
																htmlFor="flashcard-count"
																className="text-sm font-medium"
															>
																Numero di carte: {flashcardCount[0]}
															</Label>
															<div className="px-3">
																<Slider
																	id="flashcard-count"
																	min={Math.min(5, totalFlashcardQuestions)}
																	max={Math.min(totalFlashcardQuestions, 50)}
																	step={1}
																	value={flashcardCount}
																	onValueChange={setFlashcardCount}
																	className="w-full"
																/>
															</div>
															<p className="text-xs text-gray-500 dark:text-gray-400">
																Da {Math.min(5, totalFlashcardQuestions)} a{" "}
																{Math.min(totalFlashcardQuestions, 50)} carte
															</p>
														</div>
													</>
												)}
											</div>
											<div className="flex flex-col space-y-2 border-t pt-4 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
												<Button
													variant="outline"
													onClick={() => setIsSettingsOpen(false)}
													className="w-full sm:w-auto"
												>
													Annulla
												</Button>
												<Button
													onClick={() => setIsSettingsOpen(false)}
													className="w-full sm:w-auto"
												>
													Salva Impostazioni
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</>
							) : (
								<Button
									onClick={handleLoginPrompt}
									variant="outline"
									className="w-full sm:w-auto"
								>
									<Lock className="mr-2 h-4 w-4" />
									Accedi per iniziare
								</Button>
							)}

							<div className="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400 sm:justify-start">
								<Info className="h-3 w-3 flex-shrink-0" />
								<span className="text-center sm:text-left">
									{currentTab === "quiz" ? "Quiz" : "Flashcard"} completo della classe
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
