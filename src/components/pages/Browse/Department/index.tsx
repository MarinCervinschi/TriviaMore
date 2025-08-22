"use client";

import type React from "react";
import { useMemo, useState } from "react";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useEditMode } from "@/hooks/useEditMode";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import { DepartmentBreadcrumb } from "./DepartmentBreadcrumb";
import { DepartmentCourses } from "./DepartmentCourses";
import { DepartmentFilters } from "./DepartmentFilters";
import { DepartmentHeader } from "./DepartmentHeader";

interface Course {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseType: "BACHELOR" | "MASTER";
	position: number;
	departmentId: string;
	_count: {
		classes: number;
	};
}

interface Department {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	position: number;
	_count: {
		courses: number;
	};
	courses: Course[];
}

interface DepartmentFiltersProps {
	type?: "all" | "BACHELOR" | "MASTER";
	search?: string;
}

interface DepartmentPageComponentProps {
	department: Department;
}

export default function DepartmentPageComponent(props: DepartmentPageComponentProps) {
	const { isEditMode, toggleEditMode } = useEditModeContext();

	const editPermissions = useEditMode({
		departmentId: props.department.id,
	});
	const [filters, setFilters] = useState<DepartmentFiltersProps>({
		search: "",
		type: "all",
	});
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "course",
	});

	const filteredCourses = useMemo(() => {
		let filtered = [...props.department.courses];

		if (filters.search && filters.search.length > 0) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				course =>
					course.name.toLowerCase().includes(searchLower) ||
					course.code.toLowerCase().includes(searchLower)
			);
		}

		if (filters.type && filters.type !== "all") {
			filtered = filtered.filter(course => course.courseType === filters.type);
		}

		return filtered;
	}, [props.department.courses, filters]);

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "department" | "course",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{editPermissions.canEdit && (
						<div className="mb-6 flex justify-end">
							<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
						</div>
					)}

					<DepartmentBreadcrumb departmentName={props.department.name} />

					<DepartmentHeader
						department={props.department}
						isEditMode={isEditMode}
						canEdit={editPermissions.canEditDepartments}
						onEditAction={(action, data) =>
							handleEditAction(action, "department", data)
						}
					/>

					<DepartmentFilters onFilterChange={setFilters} />

					{isEditMode && editPermissions.canEditCourses && (
						<div className="mb-6">
							<button
								onClick={() => handleEditAction("create", "course")}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<span>+</span>
								Crea Nuovo Corso
							</button>
						</div>
					)}

					<DepartmentCourses
						courses={filteredCourses}
						departmentCode={props.department.code.toLowerCase()}
						filters={filters}
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
					departments: [props.department],
				}}
			/>
		</EditModeOverlay>
	);
}
