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
						<Link href={`/browse/${departmentCode}`}>{departmentName}</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{courseName}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
