import { notFound } from "next/navigation";

import DepartmentPageComponent from "@/components/pages/Browse/Department/index";
import { auth } from "@/lib/auth";
import { BrowseService } from "@/lib/services";

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
		resolvedParams.department.toUpperCase(),
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
		<DepartmentPageComponent
			user={session?.user || null}
			department={departmentData}
			filters={{
				type: resolvedSearchParams.type,
				search: resolvedSearchParams.search,
			}}
		/>
	);
}

export async function generateStaticParams() {
	const departments = await BrowseService.getAllDepartments();

	return departments.map(dept => ({
		department: dept.code.toLowerCase(),
	}));
}

export async function generateMetadata({ params }: DepartmentPageProps) {
	const resolvedParams = await params;
	const departmentData = await BrowseService.getDepartmentByCode(
		resolvedParams.department.toUpperCase()
	);

	if (!departmentData) {
		return {
			title: "Dipartimento Non Trovato - TriviaMore",
			description: "Il dipartimento richiesto non è stato trovato.",
		};
	}

	return {
		title: `${departmentData.name} - Esplora Corsi | TriviaMore`,
		description: `Esplora i corsi del dipartimento di ${departmentData.name}. ${departmentData.description ? `${departmentData.description} ` : ""}Trova quiz e materiali di studio per tutti i corsi disponibili.`,
		keywords: `${departmentData.name}, ${departmentData.code}, corsi universitari, quiz, studio, università, ${departmentData.name.toLowerCase()}`,
		openGraph: {
			title: `${departmentData.name} - Esplora Corsi`,
			description: `Esplora i corsi del dipartimento di ${departmentData.name} su TriviaMore.`,
			type: "website",
		},
	};
}
