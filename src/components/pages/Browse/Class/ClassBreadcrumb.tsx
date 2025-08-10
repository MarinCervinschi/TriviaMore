import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";

interface Department {
	id: string;
	name: string;
	code: string;
}

interface Course {
	id: string;
	name: string;
	code: string;
	department: Department;
}

interface ClassData {
	id: string;
	name: string;
	code: string;
	classYear: number;
}

interface ClassBreadcrumbProps {
	department: Department;
	course: Course;
	classData: ClassData;
	departmentCode: string;
	courseCode: string;
}

export default function ClassBreadcrumb({
	department,
	course,
	classData,
	departmentCode,
	courseCode,
}: ClassBreadcrumbProps) {
	return (
		<nav className="mb-8" aria-label="Breadcrumb">
			<ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
				<li>
					<Link
						href="/browse"
						className="flex items-center transition-colors hover:text-green-600 dark:hover:text-green-400"
					>
						<Home className="h-4 w-4" />
					</Link>
				</li>
				<ChevronRight className="h-4 w-4 text-gray-400" />
				<li>
					<Link
						href={`/browse/${departmentCode}`}
						className="transition-colors hover:text-green-600 dark:hover:text-green-400"
					>
						{department.name}
					</Link>
				</li>
				<ChevronRight className="h-4 w-4 text-gray-400" />
				<li>
					<Link
						href={`/browse/${departmentCode}/${courseCode}`}
						className="transition-colors hover:text-green-600 dark:hover:text-green-400"
					>
						{course.name}
					</Link>
				</li>
				<ChevronRight className="h-4 w-4 text-gray-400" />
				<li className="font-medium text-gray-900 dark:text-white">{classData.name}</li>
			</ol>
		</nav>
	);
}
