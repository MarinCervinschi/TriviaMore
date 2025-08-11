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
	course: Course;
}

interface SectionData {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	class: ClassData;
}

interface SectionBreadcrumbProps {
	sectionData: SectionData;
	departmentCode: string;
	courseCode: string;
	classCode: string;
}

export function SectionBreadcrumb({
	sectionData,
	departmentCode,
	courseCode,
	classCode,
}: SectionBreadcrumbProps) {
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
						<Link href={`/browse/${departmentCode}`}>
							{sectionData.class.course.department.name}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/browse/${departmentCode}/${courseCode}`}>
							{sectionData.class.course.name}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/browse/${departmentCode}/${courseCode}/${classCode}`}>
							{sectionData.class.name}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{sectionData.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
