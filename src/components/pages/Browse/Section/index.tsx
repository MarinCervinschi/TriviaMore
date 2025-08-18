"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { User } from "next-auth";
import { toast } from "sonner";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useFlashcardMutations, useQuizMutations } from "@/hooks";
import { useEditMode } from "@/hooks/useEditMode";
import { createFlashcardSession } from "@/lib/utils/flashcard-session";
import { createQuizSession } from "@/lib/utils/quiz-session";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import { FlashcardCard } from "./FlashcardCard";
import { QuestionManagement } from "./QuestionManagement";
import { QuizCard } from "./QuizCard";
import { SectionBreadcrumb } from "./SectionBreadcrumb";
import SectionHeader from "./SectionHeader";

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
	user: User | null;
	sectionData: SectionData;
	departmentCode: string;
	courseCode: string;
	classCode: string;
	isUserLoggedIn: boolean;
	evaluationModes?: EvaluationMode[];
}

export default function SectionPageComponent({
	user,
	sectionData,
	departmentCode,
	courseCode,
	classCode,
	isUserLoggedIn,
	evaluationModes = [],
}: SectionPageComponentProps) {
	const router = useRouter();
	const { startQuiz, isLoading } = useQuizMutations();
	const { startFlashcard, isLoading: isFlashcardLoading } = useFlashcardMutations();
	const { isEditMode, toggleEditMode } = useEditModeContext();

	const editPermissions = useEditMode({
		departmentId: sectionData.class.course.department.id,
		courseId: sectionData.class.course.id,
		classId: sectionData.class.id,
	});
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "question",
	});

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

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "section" | "question",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode} userRole={user?.role || null}>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{editPermissions.canEdit && (
						<div className="mb-4 flex justify-end">
							<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
						</div>
					)}

					<SectionBreadcrumb
						sectionData={sectionData}
						departmentCode={departmentCode}
						courseCode={courseCode}
						classCode={classCode}
					/>

					<SectionHeader
						sectionData={sectionData}
						isEditMode={isEditMode}
						canEdit={editPermissions.canEdit}
						onEditAction={(action, data) => handleEditAction(action, "section", data)}
					/>

					{isEditMode && editPermissions.canEditQuestions ? (
						<QuestionManagement
							sectionId={sectionData.id}
							onEditAction={(action, data) =>
								handleEditAction(action, "question", data)
							}
						/>
					) : (
						<div className="space-y-6">
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
					)}
				</div>
			</div>
			<CrudModal
				isOpen={modalState.isOpen}
				onClose={() => setModalState({ ...modalState, isOpen: false })}
				mode={modalState.mode}
				type={modalState.type}
				initialData={modalState.data}
				contextData={{
					courses: [sectionData.class.course],
					classes: [sectionData.class],
					sections: [sectionData],
				}}
			/>
		</EditModeOverlay>
	);
}
