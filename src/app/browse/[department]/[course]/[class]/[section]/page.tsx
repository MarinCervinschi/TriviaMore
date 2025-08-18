import { notFound } from "next/navigation";

import SectionPageComponent from "@/components/pages/Browse/Section/index";
import { auth } from "@/lib/auth";
import { BrowseService, EvaluationService } from "@/lib/services";

interface SectionPageProps {
	params: Promise<{
		department: string;
		course: string;
		class: string;
		section: string;
	}>;
}

export const dynamicParams = true;
export const revalidate = 3600;

export default async function SectionPage({ params }: SectionPageProps) {
	const session = await auth();
	const resolvedParams = await params;

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
			user={session?.user || null}
			sectionData={sectionData}
			departmentCode={resolvedParams.department}
			courseCode={resolvedParams.course}
			classCode={resolvedParams.class}
			isUserLoggedIn={!!session?.user}
			evaluationModes={evaluationModes}
		/>
	);
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
