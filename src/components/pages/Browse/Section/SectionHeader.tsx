import { EditModeCard } from "@/components/EditMode/edit-mode-card";

interface SectionData {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	class: {
		id: string;
		name: string;
		code: string;
		classYear: number;
		course: {
			id: string;
			name: string;
			code: string;
			department: {
				id: string;
				name: string;
				code: string;
			};
		};
	};
	_count: {
		questions: number;
		quizQuestions?: number;
		flashcardQuestions?: number;
	};
}

interface SectionHeaderProps {
	sectionData: SectionData;
	isEditMode?: boolean;
	canEdit?: boolean;
	onEditAction?: (action: "edit" | "delete", data: SectionData) => void;
}

export default function SectionHeader({
	sectionData,
	isEditMode,
	canEdit,
	onEditAction,
}: SectionHeaderProps) {
	const content = (
		<div className="mb-8">
			<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
				{sectionData.name}
			</h1>
			<p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
				{sectionData.class.name} - {sectionData.class.course.name}
			</p>
			{sectionData.description && (
				<p className="mb-6 max-w-3xl text-gray-700 dark:text-gray-300">
					{sectionData.description}
				</p>
			)}
			<div className="flex items-center space-x-4">
				<span className="text-sm text-gray-600 dark:text-gray-300">
					{sectionData._count.questions} domande disponibili
				</span>
				<span
					className={`rounded-full px-3 py-1 text-sm ${
						sectionData.isPublic
							? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
							: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
					}`}
				>
					{sectionData.isPublic ? "Sezione pubblica" : "Sezione privata"}
				</span>
			</div>
		</div>
	);

	if (isEditMode && canEdit) {
		return (
			<EditModeCard
				isEditMode={isEditMode}
				onEdit={() => onEditAction?.("edit", sectionData)}
				onDelete={() => onEditAction?.("delete", sectionData)}
				canEdit={canEdit}
				canDelete={canEdit}
			>
				{content}
			</EditModeCard>
		);
	}

	return content;
}
