interface BrowseStatsProps {
	departmentCount: number;
	totalCourses: number;
}

export function BrowseStats({ departmentCount, totalCourses }: BrowseStatsProps) {
	return (
		<div className="mb-12 flex justify-center">
			<div className="rounded-2xl border border-gray-100 bg-white px-8 py-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-center space-x-8">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{departmentCount}
						</div>
						<div className="text-sm text-gray-500 dark:text-gray-400">Dipartimenti</div>
					</div>
					<div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
							{totalCourses}
						</div>
						<div className="text-sm text-gray-500 dark:text-gray-400">Corsi Totali</div>
					</div>
				</div>
			</div>
		</div>
	);
}
