import { notFound } from "next/navigation";

import ClassPageComponent from "@/components/pages/Browse/Class/index";
import { BrowseService } from "@/lib/services";
import { EvaluationService } from "@/lib/services";

interface ClassPageProps {
	params: Promise<{
		department: string;
		course: string;
		class: string;
	}>;
}

export default async function ClassPage({ params }: ClassPageProps) {
	const resolvedParams = await params;

	const [classData, evaluationModes] = await Promise.all([
		BrowseService.getClassWithSections(
			resolvedParams.department.toUpperCase(),
			resolvedParams.course.toUpperCase(),
			resolvedParams.class.toUpperCase()
		),
		EvaluationService.getAllEvaluationModes(),
	]);

	if (!classData) {
		notFound();
	}

	return (
		<ClassPageComponent
			classData={classData}
			departmentCode={resolvedParams.department}
			courseCode={resolvedParams.course}
			evaluationModes={evaluationModes}
		/>
	);
}

export async function generateStaticParams() {
	const departments = await BrowseService.getAllDepartments();
	const params = [];

	for (const dept of departments) {
		const courses = await BrowseService.getCoursesByDepartment(dept.code);
		for (const course of courses) {
			const classes = await BrowseService.getClassesByCourse(dept.code, course.code);
			for (const cls of classes) {
				params.push({
					department: dept.code.toLowerCase(),
					course: course.code.toLowerCase(),
					class: cls.code.toLowerCase(),
				});
			}
		}
	}

	return params;
}

export async function generateMetadata({ params }: ClassPageProps) {
	const resolvedParams = await params;
	const classData = await BrowseService.getClassByCode(
		resolvedParams.department.toUpperCase(),
		resolvedParams.course.toUpperCase(),
		resolvedParams.class.toUpperCase()
	);

	if (!classData) {
		return {
			title: "Classe Non Trovata - TriviaMore",
			description: "La classe richiesta non è stata trovata.",
		};
	}

	return {
		title: `${classData.name} - Esplora Sezioni | TriviaMore`,
		description: `Esplora tutte le sezioni della classe ${classData.name} del corso ${classData.course.name}. ${classData.description ? `${classData.description} ` : ""}Trova quiz e materiali di studio per ogni sezione.`,
		keywords: `${classData.name}, ${classData.code}, sezioni, ${classData.course.name}, ${classData.course.department.name}, quiz, studio, università, ${classData.name.toLowerCase()}`,
		openGraph: {
			title: `${classData.name} - Esplora Sezioni`,
			description: `Esplora tutte le sezioni della classe ${classData.name} su TriviaMore.`,
			type: "website",
		},
	};
}
