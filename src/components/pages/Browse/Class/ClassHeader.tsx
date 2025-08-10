import { BookOpen, FileText, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ClassData {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	classYear: number;
	course: {
		name: string;
		courseType: "BACHELOR" | "MASTER";
		department: {
			name: string;
		};
	};
}

interface ClassHeaderProps {
	classData: ClassData;
	totalSections: number;
	totalQuestions: number;
}

export default function ClassHeader({
	classData,
	totalSections,
	totalQuestions,
}: ClassHeaderProps) {
	return (
		<div className="mb-8">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="mb-4 flex flex-wrap items-center gap-3">
						<Badge
							variant="secondary"
							className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
						>
							{classData.classYear}° Anno
						</Badge>
						<Badge variant="outline">{classData.code}</Badge>
						<Badge
							variant="outline"
							className={
								classData.course.courseType === "BACHELOR"
									? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
									: "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300"
							}
						>
							{classData.course.courseType === "BACHELOR" ? "Triennale" : "Magistrale"}
						</Badge>
					</div>

					<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
						{classData.name}
					</h1>

					<p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
						{classData.course.name} - {classData.course.department.name}
					</p>

					{classData.description && (
						<p className="mb-6 max-w-3xl text-gray-700 dark:text-gray-300">
							{classData.description}
						</p>
					)}

					<div className="flex flex-wrap gap-6">
						<div className="flex items-center space-x-2">
							<BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								{totalSections} {totalSections === 1 ? "sezione" : "sezioni"}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								{totalQuestions} {totalQuestions === 1 ? "domanda" : "domande"}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<GraduationCap className="h-5 w-5 text-purple-500 dark:text-purple-400" />
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								Anno {classData.classYear}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
