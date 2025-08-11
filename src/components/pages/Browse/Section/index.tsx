"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

	// Stati per le impostazioni del quiz
	const totalQuestions = sectionData._count.questions;
	const defaultQuestionCount = Math.min(20, totalQuestions);
	const [quizQuestionCount, setQuizQuestionCount] = useState([defaultQuestionCount]);
	const [quizTimeLimit, setQuizTimeLimit] = useState([30]); // Default 30 minuti
	const [selectedEvaluationMode, setSelectedEvaluationMode] = useState(
		evaluationModes.length > 0 ? evaluationModes[0].id : ""
	);
	const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);

	// Stati per le impostazioni delle flashcard
	const defaultFlashcardCount = Math.min(10, totalQuestions);
	const [flashcardCount, setFlashcardCount] = useState([defaultFlashcardCount]);
	const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] = useState(false);

	const handleStartQuiz = () => {
		// Crea una sessione con i parametri del quiz
		const quizParams = {
			sectionId: sectionData.id,
			questionCount: quizQuestionCount[0],
			timeLimit: quizTimeLimit[0],
			...(isUserLoggedIn &&
				selectedEvaluationMode && { evaluationModeId: selectedEvaluationMode }),
		};

		// Genera ID sessione breve
		const sessionId = createQuizSession(quizParams);

		// Naviga con URL pulito
		router.push(`/quiz/${sessionId}`);
	};
	const handleStartFlashcards = () => {
		// TODO: Implementare logica per avviare le flashcard
		console.log("Avvia flashcard con:", {
			cardCount: flashcardCount[0],
			sectionId: sectionData.id,
		});
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
						totalQuestions={totalQuestions}
						isUserLoggedIn={isUserLoggedIn}
						onStartQuiz={handleStartQuiz}
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
						totalQuestions={totalQuestions}
						isUserLoggedIn={isUserLoggedIn}
						onStartFlashcards={handleStartFlashcards}
						cardCount={flashcardCount}
						onCardCountChange={setFlashcardCount}
						isSettingsOpen={isFlashcardSettingsOpen}
						onSettingsOpenChange={setIsFlashcardSettingsOpen}
					/>
				</div>
			</div>
		</div>
	);
}
