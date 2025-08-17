import Link from "next/link";

import { BookOpen, ChevronRight } from "lucide-react";

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

interface CourseCardProps {
	course: Course;
	departmentCode: string;
	variant: "bachelor" | "master";
}

export function CourseCard({ course, departmentCode, variant }: CourseCardProps) {
	const isBachelor = variant === "bachelor";
	const colorClasses = isBachelor
		? {
				hover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
				text: "text-blue-600 dark:text-blue-400",
				icon: "text-blue-500 dark:text-blue-400",
				badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
				chevron: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
			}
		: {
				hover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
				text: "text-purple-600 dark:text-purple-400",
				icon: "text-purple-500 dark:text-purple-400",
				badge:
					"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
				chevron: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
			};

	return (
		<Link
			href={`/browse/${departmentCode.toLowerCase()}/${course.code.toLowerCase()}`}
			className="group relative"
		>
			<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
				<div className="mb-4 flex items-start justify-between">
					<div className="flex-1">
						<h3
							className={`mb-1 font-bold text-gray-900 transition-colors dark:text-white ${colorClasses.hover}`}
						>
							{course.name}
						</h3>
						<p className={`text-sm font-medium ${colorClasses.text}`}>{course.code}</p>
					</div>
					<ChevronRight
						className={`h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 dark:text-gray-500 ${colorClasses.chevron}`}
					/>
				</div>

				{course.description && (
					<p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
						{course.description}
					</p>
				)}

				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<BookOpen className={`h-4 w-4 ${colorClasses.icon}`} />
						<span className="text-sm text-gray-700 dark:text-gray-300">
							{course._count.classes}{" "}
							{course._count.classes === 1 ? "classe" : "classi"}
						</span>
					</div>
					<div className={`rounded-full px-2 py-1 text-xs ${colorClasses.badge}`}>
						{isBachelor ? "Triennale" : "Magistrale"}
					</div>
				</div>
			</div>
		</Link>
	);
}
