import Link from "next/link";

import { ChevronLeft } from "lucide-react";

interface CourseBreadcrumbProps {
	departmentName: string;
	departmentCode: string;
	courseName: string;
}

export function CourseBreadcrumb({
	departmentName,
	departmentCode,
	courseName,
}: CourseBreadcrumbProps) {
	return (
		<nav className="mb-8">
			<div className="flex items-center space-x-2 text-sm">
				<Link
					href="/browse"
					className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
				>
					Tutti i Dipartimenti
				</Link>
				<span className="text-gray-400 dark:text-gray-500">/</span>
				<Link
					href={`/browse/${departmentCode}`}
					className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
				>
					{departmentName}
				</Link>
				<span className="text-gray-400 dark:text-gray-500">/</span>
				<span className="font-medium text-gray-900 dark:text-white">{courseName}</span>
			</div>
		</nav>
	);
}
