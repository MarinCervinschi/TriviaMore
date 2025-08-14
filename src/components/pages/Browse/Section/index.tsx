"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { useFlashcardMutations, useQuizMutations } from "@/hooks";
import { createFlashcardSession } from "@/lib/utils/flashcard-session";
import { createQuizSession } from "@/lib/utils/quiz-session";

import { FlashcardCard } from "./FlashcardCard";
import { QuizCard } from "./QuizCard";
import { SectionBreadcrumb } from "./SectionBreadcrumb";

interface EvaluationMode {
	id: string;
	name: string;
	description?: string | null;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

interface SectionData {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	class: {
		id: string;
		name: string;
		code: string;
		classYear: number;
		course: {
			id: string;
			name: string;
			code: string;
			department: {
				id: string;
				name: string;
				code: string;
			};
		};
	};
	_count: {
		questions: number;
		quizQuestions?: number;
		flashcardQuestions?: number;
	};
}

interface SectionPageComponentProps {
	sectionData: SectionData;
	filters: {
		search?: string;
	};
	departmentCode: string;
	courseCode: string;
	classCode: string;
	isUserLoggedIn: boolean;
	evaluationModes?: EvaluationMode[];
}

export default function SectionPageComponent({
	sectionData,
	filters,
	departmentCode,
	courseCode,
	classCode,
	isUserLoggedIn,
	evaluationModes = [],
}: SectionPageComponentProps) {
	const router = useRouter();
	const { startQuiz, isLoading } = useQuizMutations();
	const { startFlashcard, isLoading: isFlashcardLoading } = useFlashcardMutations();

	const quizQuestions = sectionData._count.quizQuestions || 0;
	const flashcardQuestions = sectionData._count.flashcardQuestions || 0;
	const defaultQuestionCount = Math.min(20, quizQuestions);
	const [quizQuestionCount, setQuizQuestionCount] = useState([defaultQuestionCount]);
	const [quizTimeLimit, setQuizTimeLimit] = useState([30]); // Default 30 minuti
	const [selectedEvaluationMode, setSelectedEvaluationMode] = useState(
		evaluationModes.length > 0 ? evaluationModes[0].id : ""
	);
	const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);

	const defaultFlashcardCount = Math.min(10, flashcardQuestions);
	const [flashcardCount, setFlashcardCount] = useState([defaultFlashcardCount]);
	const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] = useState(false);

	const handleStartQuiz = async () => {
		if (isUserLoggedIn && selectedEvaluationMode) {
			const quizParams = {
				sectionId: sectionData.id,
				questionCount: quizQuestionCount[0],
				timeLimit: quizTimeLimit[0],
				quizMode: "STUDY" as const,
				evaluationModeId: selectedEvaluationMode,
			};

			await startQuiz.mutateAsync(quizParams);
		} else {
			try {
				const quizParams = {
					sectionId: sectionData.id,
					questionCount: quizQuestionCount[0],
					timeLimit: quizTimeLimit[0],
					...(isUserLoggedIn &&
						selectedEvaluationMode && { evaluationModeId: selectedEvaluationMode }),
				};

				const sessionId = createQuizSession(quizParams);

				router.push(`/quiz/${sessionId}`);
			} catch (error) {
				console.error("Errore nell'avvio del quiz guest:", error);
				toast.error("Errore nell'avvio del quiz");
			}
		}
	};
	const handleStartFlashcards = async () => {
		if (isUserLoggedIn) {
			const flashcardParams = {
				sectionId: sectionData.id,
				cardCount: flashcardCount[0],
			};

			await startFlashcard.mutateAsync(flashcardParams);
		} else {
			try {
				const flashcardParams = {
					sectionId: sectionData.id,
					cardCount: flashcardCount[0],
				};

				const sessionId = createFlashcardSession(flashcardParams);

				router.push(`/flashcard/${sessionId}`);
			} catch (error) {
				console.error("Errore nell'avvio delle flashcard guest:", error);
				toast.error("Errore nell'avvio delle flashcard");
			}
		}
	};
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Breadcrumb */}
				<SectionBreadcrumb
					sectionData={sectionData}
					departmentCode={departmentCode}
					courseCode={courseCode}
					classCode={classCode}
				/>

				{/* Header */}
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
						{sectionData.name}
					</h1>
					<p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
						{sectionData.class.name} - {sectionData.class.course.name}
					</p>
					{sectionData.description && (
						<p className="mb-6 max-w-3xl text-gray-700 dark:text-gray-300">
							{sectionData.description}
						</p>
					)}
					<div className="flex items-center space-x-4">
						<span className="text-sm text-gray-600 dark:text-gray-300">
							{sectionData._count.questions} domande disponibili
						</span>
						<span
							className={`rounded-full px-3 py-1 text-sm ${
								sectionData.isPublic
									? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
									: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
							}`}
						>
							{sectionData.isPublic ? "Sezione pubblica" : "Sezione privata"}
						</span>
					</div>
				</div>

				{/* Contenuto della sezione */}
				<div className="space-y-6">
					{/* Tenta Quiz */}
					<QuizCard
						sectionName={sectionData.name}
						totalQuestions={quizQuestions}
						isUserLoggedIn={isUserLoggedIn}
						onStartQuiz={handleStartQuiz}
						isLoading={isLoading}
						questionCount={quizQuestionCount}
						onQuestionCountChange={setQuizQuestionCount}
						timeLimit={quizTimeLimit}
						onTimeLimitChange={setQuizTimeLimit}
						evaluationModes={evaluationModes}
						selectedEvaluationMode={selectedEvaluationMode}
						onEvaluationModeChange={setSelectedEvaluationMode}
						isSettingsOpen={isQuizSettingsOpen}
						onSettingsOpenChange={setIsQuizSettingsOpen}
					/>

					{/* Flashcard */}
					<FlashcardCard
						sectionName={sectionData.name}
						totalQuestions={flashcardQuestions}
						isUserLoggedIn={isUserLoggedIn}
						onStartFlashcards={handleStartFlashcards}
						cardCount={flashcardCount}
						onCardCountChange={setFlashcardCount}
						isSettingsOpen={isFlashcardSettingsOpen}
						onSettingsOpenChange={setIsFlashcardSettingsOpen}
						isLoading={isFlashcardLoading}
					/>
				</div>
			</div>
		</div>
	);
}
