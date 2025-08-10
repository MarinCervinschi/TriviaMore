import { notFound } from "next/navigation";

import CoursePageComponent from "@/components/pages/Browse/Course/index";
import { auth } from "@/lib/auth";
import { BrowseService } from "@/lib/services/browse.service";

interface CoursePageProps {
	params: Promise<{
		department: string;
		course: string;
	}>;
	searchParams: Promise<{
		year?: string;
		search?: string;
	}>;
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
	const session = await auth();

	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const courseData = await BrowseService.getCourseWithClasses(
		resolvedParams.department.toUpperCase(),
		resolvedParams.course.toUpperCase(),
		{
			classYear: resolvedSearchParams.year
				? parseInt(resolvedSearchParams.year)
				: undefined,
			search: resolvedSearchParams.search,
		},
		session?.user?.id
	);

	if (!courseData) {
		notFound();
	}

	return (
		<CoursePageComponent
			course={courseData}
			filters={{
				year: resolvedSearchParams.year,
				search: resolvedSearchParams.search,
			}}
			departmentCode={resolvedParams.department}
			isUserLoggedIn={!!session?.user}
		/>
	);
}

export async function generateStaticParams() {
	const departments = await BrowseService.getAllDepartments();
	const params = [];

	for (const dept of departments) {
		const courses = await BrowseService.getCoursesByDepartment(dept.code);
		for (const course of courses) {
			params.push({
				department: dept.code.toLowerCase(),
				course: course.code.toLowerCase(),
			});
		}
	}

	return params;
}

export async function generateMetadata({ params }: CoursePageProps) {
	const resolvedParams = await params;
	const courseData = await BrowseService.getCourseByCode(
		resolvedParams.department,
		resolvedParams.course
	);

	if (!courseData) {
		return {
			title: "Course Not Found",
		};
	}

	return {
		title: `${courseData.name} - Browse Classes`,
		description: `Explore classes in ${courseData.name} course. ${courseData.description || ""}`,
		keywords: `${courseData.name}, ${courseData.code}, classes, ${courseData.department.name}`,
	};
}
