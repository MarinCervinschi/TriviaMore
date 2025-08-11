"use client";

import { SectionBreadcrumb } from "./SectionBreadcrumb";

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
	};
}

interface SectionPageComponentProps {
	sectionData: SectionData;
	filters: {
		search?: string;
	};
	departmentCode: string;
	courseCode: string;
	classCode: string;
	isUserLoggedIn: boolean;
}

export default function SectionPageComponent({
	sectionData,
	filters,
	departmentCode,
	courseCode,
	classCode,
	isUserLoggedIn,
}: SectionPageComponentProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Breadcrumb */}
				<SectionBreadcrumb
					sectionData={sectionData}
					departmentCode={departmentCode}
					courseCode={courseCode}
					classCode={classCode}
				/>

				{/* Header */}
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

				{/* Contenuto temporaneo */}
				<div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
					<h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
						Contenuto della sezione
					</h2>
					<p className="text-gray-600 dark:text-gray-300">
						Questa pagina verrà implementata con quiz, domande e altre funzionalità per
						la sezione &quot;{sectionData.name}&quot;.
					</p>
					<div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							💡 In futuro qui troverai:
						</p>
						<ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
							<li>• Quiz interattivi per questa sezione</li>
							<li>• Domande di studio e ripasso</li>
							<li>• Statistiche del tuo progresso</li>
							<li>• Materiali di studio correlati</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
