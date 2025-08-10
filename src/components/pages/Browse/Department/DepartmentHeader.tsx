import { BookOpen } from "lucide-react";

interface Department {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	_count: {
		courses: number;
	};
}

interface DepartmentHeaderProps {
	department: Department;
}

export function DepartmentHeader({ department }: DepartmentHeaderProps) {
	return (
		<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<div className="flex flex-col md:flex-row md:items-start md:justify-between">
				<div className="mb-6 flex-1 md:mb-0">
					<div className="mb-4 flex items-center space-x-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
							<BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
								{department.name}
							</h1>
							<p className="font-medium text-blue-600 dark:text-blue-400">
								{department.code}
							</p>
						</div>
					</div>
					{department.description && (
						<p className="max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
							{department.description}
						</p>
					)}
				</div>

				<div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/50">
					<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{department._count.courses}
					</div>
					<div className="text-sm text-blue-700 dark:text-blue-300">
						{department._count.courses === 1 ? "Corso" : "Corsi"} Disponibili
					</div>
				</div>
			</div>
		</div>
	);
}
