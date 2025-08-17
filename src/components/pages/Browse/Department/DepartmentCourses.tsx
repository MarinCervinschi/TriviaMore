import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CourseCard } from "./CourseCard";

interface Course {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseType: "BACHELOR" | "MASTER";
	_count: {
		classes: number;
	};
}

interface DepartmentFilters {
	type?: "BACHELOR" | "MASTER";
	search?: string;
}

interface DepartmentCoursesProps {
	courses: Course[];
	departmentCode: string;
	filters: DepartmentFilters;
	hasActiveFilters: boolean;
	onClearFilters: () => void;
}

export function DepartmentCourses({
	courses,
	departmentCode,
	filters,
	hasActiveFilters,
	onClearFilters,
}: DepartmentCoursesProps) {
	if (courses.length === 0) {
		return (
			<div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
					<BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
				</div>
				<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
					Nessun corso trovato
				</h3>
				<p className="mb-6 text-gray-600 dark:text-gray-300">
					Non ci sono corsi che corrispondono ai filtri selezionati.
				</p>
				{hasActiveFilters && (
					<Button variant="outline" onClick={onClearFilters}>
						Rimuovi Filtri
					</Button>
				)}
			</div>
		);
	}

	const bachelorCourses = courses.filter(c => c.courseType === "BACHELOR");
	const masterCourses = courses.filter(c => c.courseType === "MASTER");

	return (
		<div className="space-y-12">
			{/* Bachelor Courses */}
			{(!filters.type || filters.type === "BACHELOR") && bachelorCourses.length > 0 && (
				<div>
					<div className="mb-6 flex items-center">
						<div className="rounded-lg bg-blue-100 px-4 py-2 dark:bg-blue-900/50">
							<h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
								Lauree Triennali
							</h2>
						</div>
						<div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
							{bachelorCourses.length}{" "}
							{bachelorCourses.length === 1 ? "corso" : "corsi"}
						</div>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{bachelorCourses.map(course => (
							<CourseCard
								key={course.id}
								course={course}
								departmentCode={departmentCode}
								variant="bachelor"
							/>
						))}
					</div>
				</div>
			)}

			{/* Master Courses */}
			{(!filters.type || filters.type === "MASTER") && masterCourses.length > 0 && (
				<div>
					<div className="mb-6 flex items-center">
						<div className="rounded-lg bg-purple-100 px-4 py-2 dark:bg-purple-900/50">
							<h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
								Lauree Magistrali
							</h2>
						</div>
						<div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
							{masterCourses.length} {masterCourses.length === 1 ? "corso" : "corsi"}
						</div>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{masterCourses.map(course => (
							<CourseCard
								key={course.id}
								course={course}
								departmentCode={departmentCode}
								variant="master"
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
