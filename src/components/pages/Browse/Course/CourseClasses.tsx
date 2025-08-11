import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ClassCard } from "./ClassCard";

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

interface CourseFilters {
	year?: string;
	search?: string;
}

interface CourseClassesProps {
	classes: Class[];
	departmentCode: string;
	courseCode: string;
	filters: CourseFilters;
	hasActiveFilters: boolean;
	onClearFilters: () => void;
}

export function CourseClasses({
	classes,
	departmentCode,
	courseCode,
	filters,
	hasActiveFilters,
	onClearFilters,
}: CourseClassesProps) {
	if (classes.length === 0) {
		return (
			<div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
					<BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
				</div>
				<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
					Nessuna classe trovata
				</h3>
				<p className="mb-6 text-gray-600 dark:text-gray-300">
					Non ci sono classi che corrispondono ai filtri selezionati.
				</p>
				{hasActiveFilters && (
					<Button variant="outline" onClick={onClearFilters}>
						Rimuovi Filtri
					</Button>
				)}
			</div>
		);
	}

	// Group classes by year
	const classesByYear = classes.reduce(
		(acc, cls) => {
			const year = cls.classYear;
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(cls);
			return acc;
		},
		{} as Record<number, Class[]>
	);

	const years = Object.keys(classesByYear)
		.map(Number)
		.sort((a, b) => a - b);

	return (
		<div className="space-y-12">
			{years.map(year => {
				const yearClasses = classesByYear[year];

				return (
					<div key={year}>
						<div className="mb-6 flex items-center">
							<div className="rounded-lg bg-green-100 px-4 py-2 dark:bg-green-900/50">
								<h2 className="text-xl font-bold text-green-800 dark:text-green-200">
									{year}° Anno
								</h2>
							</div>
							<div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
								{yearClasses.length} {yearClasses.length === 1 ? "classe" : "classi"}
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{yearClasses.map(cls => (
								<ClassCard
									key={cls.id}
									class={cls}
									departmentCode={departmentCode}
									courseCode={courseCode}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
