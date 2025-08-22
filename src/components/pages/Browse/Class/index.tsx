"use client";

import { useState } from "react";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useEditMode } from "@/hooks/useEditMode";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import ClassBreadcrumb from "./ClassBreadcrumb";
import ClassFilters from "./ClassFilters";
import ClassHeader from "./ClassHeader";
import ClassSections from "./ClassSections";
import ExamSimulationButton from "./ExamSimulationButton";

interface Section {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	_count: {
		questions: number;
		quizQuestions: number;
		flashcardQuestions: number;
	};
}

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
	code: string;
	description?: string | null;
	courseId: string;
	classYear: number;
	position: number;
	isEnrolled?: boolean;
	course: {
		id: string;
		name: string;
		code: string;
		description?: string | null;
		courseType: "BACHELOR" | "MASTER";
		position: number;
		departmentId: string;
		department: {
			id: string;
			name: string;
			code: string;
		};
	};
	_count: {
		sections: number;
	};
	sections: Section[];
}

interface ClassPageComponentProps {
	classData: ClassData;
	departmentCode: string;
	courseCode: string;
	evaluationModes: EvaluationMode[];
}

export default function ClassPageComponent({
	classData,
	departmentCode,
	courseCode,
	evaluationModes,
}: ClassPageComponentProps) {
	const { isEditMode, toggleEditMode } = useEditModeContext();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const editPermissions = useEditMode({
		departmentId: classData.course.departmentId,
		courseId: classData.courseId,
		classId: classData.id,
	});

	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "section",
	});

	const filteredSections = searchQuery
		? classData.sections.filter(
				section =>
					section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					section.description?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: classData.sections;

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "section" | "class",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode}>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{editPermissions.canEdit && (
						<div className="mb-6 flex justify-end">
							<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
						</div>
					)}

					<ClassBreadcrumb
						department={classData.course.department}
						course={classData.course}
						classData={classData}
						departmentCode={departmentCode}
						courseCode={courseCode}
					/>

					<ClassHeader
						classData={classData}
						totalSections={filteredSections.length}
						totalQuestions={filteredSections.reduce(
							(acc, section) => acc + section._count.questions,
							0
						)}
						isEnrolled={classData.isEnrolled}
						isEditMode={isEditMode}
						canEdit={editPermissions.canEditClasses}
						onEditAction={(action, data) => handleEditAction(action, "class", data)}
					/>

					{!isEditMode && (
						<ExamSimulationButton
							classData={classData}
							evaluationModes={evaluationModes}
						/>
					)}

					<ClassFilters
						onSearchChange={setSearchQuery}
						totalResults={filteredSections.length}
					/>

					{isEditMode && editPermissions.canEditSections && (
						<div className="mb-6">
							<button
								onClick={() => handleEditAction("create", "section")}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<span>+</span>
								Crea Nuova Sezione
							</button>
						</div>
					)}

					<ClassSections
						sections={filteredSections}
						departmentCode={departmentCode}
						courseCode={courseCode}
						classCode={classData.code.toLowerCase()}
					/>
				</div>
			</div>
			<CrudModal
				isOpen={modalState.isOpen}
				onClose={() => setModalState({ ...modalState, isOpen: false })}
				mode={modalState.mode}
				type={modalState.type}
				initialData={modalState.data}
				contextData={{
					departments: [classData.course.department],
					courses: [classData.course],
					classes: [classData],
				}}
			/>
		</EditModeOverlay>
	);
}
