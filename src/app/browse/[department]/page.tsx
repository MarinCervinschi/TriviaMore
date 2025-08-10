import { notFound } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import DepartmentPageComponent from "@/components/pages/Browse/Department/index";
import { auth } from "@/lib/auth";
import { BrowseService } from "@/lib/services/browse.service";

interface DepartmentPageProps {
	params: Promise<{
		department: string;
	}>;
	searchParams: Promise<{
		type?: "BACHELOR" | "MASTER";
		search?: string;
	}>;
}

export default async function DepartmentPage({
	params,
	searchParams,
}: DepartmentPageProps) {
	const session = await auth();

	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const departmentData = await BrowseService.getDepartmentWithCourses(
		resolvedParams.department,
		{
			courseType: resolvedSearchParams.type,
			search: resolvedSearchParams.search,
		},
		session?.user?.id
	);

	if (!departmentData) {
		notFound();
	}

	return (
		<AppLayout user={session?.user}>
			<DepartmentPageComponent
				department={departmentData}
				filters={{
					type: resolvedSearchParams.type,
					search: resolvedSearchParams.search,
				}}
			/>
		</AppLayout>
	);
}

export async function generateStaticParams() {
	const departments = await BrowseService.getAllDepartments();

	return departments.map(dept => ({
		department: dept.code,
	}));
}

export async function generateMetadata({ params }: DepartmentPageProps) {
	const resolvedParams = await params;
	const departmentData = await BrowseService.getDepartmentByCode(
		resolvedParams.department
	);

	if (!departmentData) {
		return {
			title: "Department Not Found",
		};
	}

	return {
		title: `${departmentData.name} - Browse Courses`,
		description: `Explore courses in ${departmentData.name} department. ${departmentData.description || ""}`,
		keywords: `${departmentData.name}, ${departmentData.code}, courses, university`,
	};
}
