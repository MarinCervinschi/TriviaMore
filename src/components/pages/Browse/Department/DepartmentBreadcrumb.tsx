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

interface DepartmentBreadcrumbProps {
	departmentName: string;
}

export function DepartmentBreadcrumb({ departmentName }: DepartmentBreadcrumbProps) {
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
					<BreadcrumbPage>{departmentName}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
