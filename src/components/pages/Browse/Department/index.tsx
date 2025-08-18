"use client";

import type React from "react";
import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { User } from "next-auth";

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

interface DepartmentFilters {
	type?: "BACHELOR" | "MASTER";
	search?: string;
}

interface DepartmentPageComponentProps {
	user: User | null;
	department: Department;
	filters: DepartmentFilters;
}

export default function DepartmentPageComponent(props: DepartmentPageComponentProps) {
	const { isEditMode, toggleEditMode } = useEditModeContext();

	const editPermissions = useEditMode({
		departmentId: props.department.id,
	});
	const router = useRouter();
	const searchParams = useSearchParams();
	const [filters, setFilters] = useState(props.filters);
	const [searchValue, setSearchValue] = useState(props.filters.search || "");
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "course",
	});

	const updateFilters = (newFilters: Partial<DepartmentFilters>) => {
		const params = new URLSearchParams(searchParams);

		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		router.push(`/browse/${props.department.code.toLowerCase()}?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const newFilters = { ...filters, search: searchValue || undefined };
		setFilters(newFilters);
		updateFilters(newFilters);
	};

	const clearFilters = () => {
		const newFilters = {};
		setFilters(newFilters);
		setSearchValue("");
		router.push(`/browse/${props.department.code.toLowerCase()}`);
	};

	const handleFilterChange = (newFilters: Partial<DepartmentFilters>) => {
		const updatedFilters = { ...filters, ...newFilters };
		setFilters(updatedFilters);
		updateFilters(updatedFilters);
	};

	const filteredCourses = props.department.courses.filter(course => {
		const matchesType = !filters.type || course.courseType === filters.type;
		const matchesSearch =
			!filters.search ||
			course.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			course.code.toLowerCase().includes(filters.search.toLowerCase());
		return matchesType && matchesSearch;
	});

	const hasActiveFilters = Boolean(filters.type || filters.search);

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "department" | "course",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	return (
		<EditModeOverlay isActive={isEditMode} userRole={props.user?.role || null}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

					<DepartmentFilters
						filters={filters}
						searchValue={searchValue}
						onSearchValueChange={setSearchValue}
						onSearch={handleSearch}
						onFilterChange={handleFilterChange}
						onClearFilters={clearFilters}
					/>

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
						hasActiveFilters={hasActiveFilters}
						onClearFilters={clearFilters}
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
