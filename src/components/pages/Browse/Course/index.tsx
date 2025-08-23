"use client";

import { useMemo, useState } from "react";

import { useSession } from "next-auth/react";

import { EditModeButton } from "@/components/EditMode/edit-mode-button";
import { EditModeOverlay } from "@/components/EditMode/edit-mode-overlay";
import { CrudModal, Modal } from "@/components/modals/CrudModal";
import { useEditMode } from "@/hooks/useEditMode";
import { useUserSectionsAccessCountByCourse } from "@/hooks/useUserData";
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

interface CourseFiltersProps {
	year?: string;
	search?: string;
}

interface CoursePageComponentProps {
	course: Course;
	departmentCode: string;
}

export default function CoursePageComponent({
	course,
	departmentCode,
}: CoursePageComponentProps) {
	const { data: session } = useSession();
	const userId = session?.user.id;
	const { data: countUserSectionsAccess } = useUserSectionsAccessCountByCourse(
		userId,
		course.id
	);

	if (countUserSectionsAccess) {
		course.classes = course.classes.map(cls => ({
			...cls,
			_count: {
				sections: countUserSectionsAccess[cls.id] ?? 0,
			},
		}));
	}

	const [filters, setFilters] = useState<CourseFiltersProps>({
		year: "all",
		search: "",
	});

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

	const handleEditAction = (
		action: "create" | "edit" | "delete",
		type: "course" | "class",
		data?: any
	) => {
		setModalState({ isOpen: true, mode: action, type, data });
	};

	const filteredClasses = useMemo(() => {
		let filtered = [...course.classes];

		if (filters.search && filters.search.length > 0) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				cls =>
					cls.name.toLowerCase().includes(searchLower) ||
					cls.code.toLowerCase().includes(searchLower)
			);
		}

		if (filters.year && filters.year !== "all") {
			filtered = filtered.filter(cls => cls.classYear.toString() === filters.year);
		}

		return filtered;
	}, [course.classes, filters]);

	const availableYears = useMemo(
		() =>
			Array.from(new Set(course.classes.map(cls => cls.classYear))).sort(
				(a, b) => a - b
			),
		[course.classes]
	);

	return (
		<EditModeOverlay isActive={isEditMode}>
			<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

					<CourseFilters availableYears={availableYears} onFilterChange={setFilters} />

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
