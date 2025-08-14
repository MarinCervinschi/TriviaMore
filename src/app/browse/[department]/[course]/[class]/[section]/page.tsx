import { notFound } from "next/navigation";

import SectionPageComponent from "@/components/pages/Browse/Section/index";
import { auth } from "@/lib/auth";
import { BrowseService } from "@/lib/services";
import { EvaluationService } from "@/lib/services";

interface SectionPageProps {
	params: Promise<{
		department: string;
		course: string;
		class: string;
		section: string;
	}>;
	searchParams: Promise<{
		search?: string;
	}>;
}

export default async function SectionPage({ params, searchParams }: SectionPageProps) {
	const session = await auth();

	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const [sectionData, evaluationModes] = await Promise.all([
		BrowseService.getSectionByName(
			resolvedParams.department.toUpperCase(),
			resolvedParams.course.toUpperCase(),
			resolvedParams.class.toUpperCase(),
			resolvedParams.section,
			session?.user?.id
		),
		EvaluationService.getAllEvaluationModes(),
	]);

	if (!sectionData) {
		notFound();
	}

	return (
		<SectionPageComponent
			sectionData={sectionData}
			filters={{
				search: resolvedSearchParams.search,
			}}
			departmentCode={resolvedParams.department}
			courseCode={resolvedParams.course}
			classCode={resolvedParams.class}
			isUserLoggedIn={!!session?.user}
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
				const sections = await BrowseService.getSectionsByClass(
					dept.code,
					course.code,
					cls.code
				);
				for (const section of sections) {
					// Converti il nome della sezione per l'URL
					const sectionUrlName = section.name.toLowerCase().replace(/\s+/g, "-");
					params.push({
						department: dept.code.toLowerCase(),
						course: course.code.toLowerCase(),
						class: cls.code.toLowerCase(),
						section: sectionUrlName,
					});
				}
			}
		}
	}

	return params;
}

export async function generateMetadata({ params }: SectionPageProps) {
	const resolvedParams = await params;
	const sectionData = await BrowseService.getSectionByName(
		resolvedParams.department.toUpperCase(),
		resolvedParams.course.toUpperCase(),
		resolvedParams.class.toUpperCase(),
		resolvedParams.section
	);

	if (!sectionData) {
		return {
			title: "Sezione Non Trovata - TriviaMore",
			description: "La sezione richiesta non è stata trovata.",
		};
	}

	return {
		title: `${sectionData.name} - Quiz e Domande | TriviaMore`,
		description: `Esplora quiz e domande della sezione ${sectionData.name} della classe ${sectionData.class.name}. ${sectionData.description ? `${sectionData.description} ` : ""}Studia e mettiti alla prova con quiz interattivi.`,
		keywords: `${sectionData.name}, quiz, domande, ${sectionData.class.name}, ${sectionData.class.course.name}, ${sectionData.class.course.department.name}, studio, università, ${sectionData.name.toLowerCase()}`,
		openGraph: {
			title: `${sectionData.name} - Quiz e Domande`,
			description: `Esplora quiz e domande della sezione ${sectionData.name} su TriviaMore.`,
			type: "website",
		},
	};
}
