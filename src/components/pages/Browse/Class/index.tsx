"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

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
	filters: {
		search?: string;
	};
	departmentCode: string;
	courseCode: string;
	isUserLoggedIn: boolean;
	evaluationModes: EvaluationMode[];
}

export default function ClassPageComponent({
	classData,
	filters,
	departmentCode,
	courseCode,
	isUserLoggedIn,
	evaluationModes,
}: ClassPageComponentProps) {
	const { data: session } = useSession();
	const { isEditMode, toggleEditMode } = useEditModeContext();
	const editPermissions = useEditMode({
		departmentId: classData.course.departmentId,
		courseId: classData.courseId,
		classId: classData.id,
	});

	const [searchQuery, setSearchQuery] = useState(filters.search || "");
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "section",
	});

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		const params = new URLSearchParams();
		if (query) {
			params.set("search", query);
		}
		window.history.pushState(
			{},
			"",
			`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
		);
	};

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
		<EditModeOverlay isActive={isEditMode} userRole={session?.user?.role || null}>
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
							isUserLoggedIn={isUserLoggedIn}
							evaluationModes={evaluationModes}
						/>
					)}

					<ClassFilters
						searchQuery={searchQuery}
						onSearchChange={handleSearch}
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
						isUserLoggedIn={isUserLoggedIn}
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
