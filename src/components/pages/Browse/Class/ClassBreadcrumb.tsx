import Link from "next/link";

import { Home } from "lucide-react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
		<Breadcrumb className="mb-8">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/browse" className="flex items-center">
							<Home className="h-4 w-4" />
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/browse/${departmentCode}`}>{department.name}</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/browse/${departmentCode}/${courseCode}`}>{course.name}</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{classData.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
