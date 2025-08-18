"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { User } from "next-auth";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useEditMode } from "@/hooks/useEditMode";
import { useEditModeContext } from "@/providers/edit-mode-provider";

import { CourseBreadcrumb } from "./CourseBreadcrumb";
import { CourseClasses } from "./CourseClasses";
import { CourseFilters } from "./CourseFilters";
import { CourseHeader } from "./CourseHeader";

interface Department {
	id: string;
	name: string;
	code: string;
}

interface Class {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseId: string;
	classYear: number;
	position: number;
	_count: {
		sections: number;
	};
}

interface Course {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseType: "BACHELOR" | "MASTER";
	position: number;
	departmentId: string;
	department: Department;
	_count: {
		classes: number;
	};
	classes: Class[];
}

interface CourseFilters {
	year?: string;
	search?: string;
}

interface CoursePageComponentProps {
	user: User | null;
	course: Course;
	filters: CourseFilters;
	departmentCode: string;
}

export default function CoursePageComponent({
	user,
	course,
	filters: initialFilters,
	departmentCode,
}: CoursePageComponentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [filters, setFilters] = useState<CourseFilters>(initialFilters);
	const [searchValue, setSearchValue] = useState(initialFilters.search || "");

	const { isEditMode, toggleEditMode } = useEditModeContext();
	const editPermissions = useEditMode({
		departmentId: course.departmentId,
		courseId: course.id,
	});
	const [modalState, setModalState] = useState<Modal>({
		isOpen: false,
		mode: "create",
		type: "class",
	});

	const updateFilters = (newFilters: Partial<CourseFilters>) => {
		const params = new URLSearchParams(searchParams);

		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		router.push(
			`/browse/${departmentCode}/${course.code.toLowerCase()}?${params.toString()}`
		);
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
		router.push(`/browse/${departmentCode}/${course.code.toLowerCase()}`);
	};

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "course" | "class",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	const handleFilterChange = (newFilters: Partial<CourseFilters>) => {
		const updatedFilters = { ...filters, ...newFilters };
		setFilters(updatedFilters);
		updateFilters(updatedFilters);
	};

	const filteredClasses = course.classes.filter(cls => {
		const matchesYear = !filters.year || cls.classYear.toString() === filters.year;
		const matchesSearch =
			!filters.search ||
			cls.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			cls.code.toLowerCase().includes(filters.search.toLowerCase());
		return matchesYear && matchesSearch;
	});

	const hasActiveFilters = Boolean(filters.year || filters.search);

	const availableYears = Array.from(
		new Set(course.classes.map(cls => cls.classYear))
	).sort((a, b) => a - b);

	return (
		<EditModeOverlay isActive={isEditMode} userRole={user?.role || null}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{editPermissions.canEdit && (
						<div className="mb-4 flex justify-end">
							<EditModeButton isActive={isEditMode} onToggle={toggleEditMode} />
						</div>
					)}

					<CourseBreadcrumb
						departmentName={course.department.name}
						departmentCode={departmentCode}
						courseName={course.name}
					/>

					<CourseHeader
						course={course}
						isEditMode={isEditMode}
						canEdit={editPermissions.canEditCourses}
						onEditAction={(action, data) => handleEditAction(action, "course", data)}
					/>

					<CourseFilters
						filters={filters}
						searchValue={searchValue}
						availableYears={availableYears}
						onSearchValueChange={setSearchValue}
						onSearch={handleSearch}
						onFilterChange={handleFilterChange}
						onClearFilters={clearFilters}
					/>

					{isEditMode && editPermissions.canEditClasses && (
						<div className="mb-6">
							<button
								onClick={() => handleEditAction("create", "class")}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<span>+</span>
								Crea Nuova Classe
							</button>
						</div>
					)}

					<CourseClasses
						classes={filteredClasses}
						departmentCode={departmentCode}
						courseCode={course.code.toLowerCase()}
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
					departments: [course.department],
					courses: [course],
				}}
			/>
		</EditModeOverlay>
	);
}
