import { BookOpen, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { AddCourseButton } from "./AddCourseButton";

interface Department {
	id: string;
	name: string;
	code: string;
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
}

interface CourseHeaderProps {
	course: Course;
	showAddButton?: boolean;
}

export function CourseHeader({ course, showAddButton = false }: CourseHeaderProps) {
	const courseTypeLabel =
		course.courseType === "BACHELOR" ? "Laurea Triennale" : "Laurea Magistrale";
	const courseTypeColor = course.courseType === "BACHELOR" ? "blue" : "purple";

	return (
		<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<div className="flex flex-col md:flex-row md:items-start md:justify-between">
				<div className="mb-6 flex-1 md:mb-0">
					<div className="mb-4 flex items-center space-x-3">
						<div
							className={`flex h-12 w-12 items-center justify-center rounded-full ${
								course.courseType === "BACHELOR"
									? "bg-blue-100 dark:bg-blue-900/50"
									: "bg-purple-100 dark:bg-purple-900/50"
							}`}
						>
							<GraduationCap
								className={`h-6 w-6 ${
									course.courseType === "BACHELOR"
										? "text-blue-600 dark:text-blue-400"
										: "text-purple-600 dark:text-purple-400"
								}`}
							/>
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
								{course.name}
							</h1>
							<div className="mt-1 flex items-center space-x-2">
								<p
									className={`font-medium ${
										course.courseType === "BACHELOR"
											? "text-blue-600 dark:text-blue-400"
											: "text-purple-600 dark:text-purple-400"
									}`}
								>
									{course.code}
								</p>
								<Badge
									variant="secondary"
									className={`${
										course.courseType === "BACHELOR"
											? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
											: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
									}`}
								>
									{courseTypeLabel}
								</Badge>
							</div>
						</div>
					</div>
					{course.description && (
						<p className="max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
							{course.description}
						</p>
					)}

					{/* Pulsante di aggiunta corso per utenti loggati */}
					{showAddButton && (
						<div className="mt-4">
							<AddCourseButton courseId={course.id} courseName={course.name} />
						</div>
					)}
				</div>

				<div
					className={`rounded-xl p-4 text-center ${
						course.courseType === "BACHELOR"
							? "bg-blue-50 dark:bg-blue-900/50"
							: "bg-purple-50 dark:bg-purple-900/50"
					}`}
				>
					<div
						className={`text-2xl font-bold ${
							course.courseType === "BACHELOR"
								? "text-blue-600 dark:text-blue-400"
								: "text-purple-600 dark:text-purple-400"
						}`}
					>
						{course._count.classes}
					</div>
					<div
						className={`text-sm ${
							course.courseType === "BACHELOR"
								? "text-blue-700 dark:text-blue-300"
								: "text-purple-700 dark:text-purple-300"
						}`}
					>
						{course._count.classes === 1 ? "Classe" : "Classi"} Disponibili
					</div>
				</div>
			</div>
		</div>
	);
}
