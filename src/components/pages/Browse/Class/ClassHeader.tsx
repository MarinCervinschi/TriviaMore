import { BookOpen, FileText, GraduationCap } from "lucide-react";

import { EditModeCard } from "@/components/EditMode/edit-mode-card";
import { Badge } from "@/components/ui/badge";

import { AddClassButton } from "./AddClassButton";

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
	isEnrolled?: boolean;
	isEditMode?: boolean;
	canEdit?: boolean;
	onEditAction?: (action: "edit" | "delete", data: ClassData) => void;
}

export default function ClassHeader({
	classData,
	totalSections,
	totalQuestions,
	isEnrolled = false,
	isEditMode = false,
	canEdit = false,
	onEditAction,
}: ClassHeaderProps) {
	const content = (
		<div className="mb-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="min-w-0 flex-1">
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

					<h1 className="mb-2 break-words text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
						{classData.name}
					</h1>

					<p className="mb-4 break-words text-base text-gray-600 dark:text-gray-300 md:text-lg">
						{classData.course.name} - {classData.course.department.name}
					</p>

					{classData.description && (
						<p className="mb-6 max-w-full break-words text-gray-700 dark:text-gray-300 md:max-w-3xl">
							{classData.description}
						</p>
					)}

					<div className="flex flex-wrap gap-4 md:gap-6">
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

				{/* Pulsante di aggiunta/rimozione classe */}
				<div className="flex justify-end md:ml-6 md:flex-shrink-0">
					<AddClassButton
						classId={classData.id}
						className={classData.name}
						isEnrolled={isEnrolled}
					/>
				</div>
			</div>
		</div>
	);

	if (isEditMode && canEdit) {
		return (
			<EditModeCard
				isEditMode={isEditMode}
				onEdit={() => onEditAction?.("edit", classData)}
				onDelete={() => onEditAction?.("delete", classData)}
				canEdit={canEdit}
				canDelete={canEdit}
			>
				{content}
			</EditModeCard>
		);
	}

	return content;
}
