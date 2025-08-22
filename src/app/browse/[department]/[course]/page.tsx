import { notFound } from "next/navigation";

import CoursePageComponent from "@/components/pages/Browse/Course/index";
import { BrowseService } from "@/lib/services";

interface CoursePageProps {
	params: Promise<{
		department: string;
		course: string;
	}>;
}

export default async function CoursePage({ params }: CoursePageProps) {
	const resolvedParams = await params;

	const courseData = await BrowseService.getCourseWithClasses(
		resolvedParams.department.toUpperCase(),
		resolvedParams.course.toUpperCase()
	);

	if (!courseData) {
		notFound();
	}

	return (
		<CoursePageComponent
			course={courseData}
			departmentCode={resolvedParams.department}
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
		resolvedParams.department.toUpperCase(),
		resolvedParams.course
	);

	if (!courseData) {
		return {
			title: "Corso Non Trovato - TriviaMore",
			description: "Il corso richiesto non è stato trovato.",
		};
	}

	return {
		title: `${courseData.name} - Esplora Sezioni | TriviaMore`,
		description: `Esplora tutte le sezioni del corso ${courseData.name} nel dipartimento di ${courseData.department.name}. ${courseData.description ? `${courseData.description} ` : ""}Trova quiz e materiali di studio per ogni sezione.`,
		keywords: `${courseData.name}, ${courseData.code}, sezioni, ${courseData.department.name}, quiz, studio, università, ${courseData.name.toLowerCase()}`,
		openGraph: {
			title: `${courseData.name} - Esplora Sezioni`,
			description: `Esplora tutte le sezioni del corso ${courseData.name} su TriviaMore.`,
			type: "website",
		},
	};
}
