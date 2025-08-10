import Link from "next/link";

import { ChevronLeft } from "lucide-react";

interface DepartmentBreadcrumbProps {
	departmentName: string;
}

export function DepartmentBreadcrumb({ departmentName }: DepartmentBreadcrumbProps) {
	return (
		<nav className="mb-8">
			<div className="flex items-center space-x-2 text-sm">
				<Link
					href="/browse"
					className="flex items-center text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
				>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Tutti i Dipartimenti
				</Link>
				<span className="text-gray-400 dark:text-gray-500">/</span>
				<span className="font-medium text-gray-900 dark:text-white">
					{departmentName}
				</span>
			</div>
		</nav>
	);
}
