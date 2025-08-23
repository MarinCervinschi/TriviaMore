"use client";

import Head from "next/head";
import { notFound, useParams } from "next/navigation";

import SectionPageComponent from "@/components/pages/Browse/Section/index";
import { useSectionData } from "@/hooks/useSectionData";

import SectionLoadingPage from "./loading";

export default function SectionPage() {
	const {
		department: departmentCode,
		course: courseCode,
		class: classCode,
		section: sectionName,
	} = useParams<{
		department: string;
		course: string;
		class: string;
		section: string;
	}>();
	const { data, isLoading, isError } = useSectionData({
		departmentCode: departmentCode.toUpperCase(),
		courseCode: courseCode.toUpperCase(),
		classCode: classCode.toUpperCase(),
		sectionName,
	});

	if (isLoading) {
		return <SectionLoadingPage />;
	}
	const { sectionData, evaluationModes } = data;

	if (!sectionData || !evaluationModes || isError) {
		notFound();
	}

	return (
		<>
			<Head>
				<title>{sectionData.name} - Quiz e Domande | TriviaMore</title>
				<meta
					name="description"
					content={`Esplora quiz e domande della sezione ${sectionData.name} della classe ${sectionData.class.name}. ${sectionData.description ? `${sectionData.description} ` : ""}Studia e mettiti alla prova con quiz interattivi.`}
				/>
				<meta
					name="keywords"
					content={`${sectionData.name}, quiz, domande, ${sectionData.class.name}, ${sectionData.class.course.name}, ${sectionData.class.course.department.name}, studio, università, ${sectionData.name.toLowerCase()}`}
				/>
				<meta property="og:title" content={`${sectionData.name} - Quiz e Domande`} />
				<meta
					property="og:description"
					content={`Esplora quiz e domande della sezione ${sectionData.name} su TriviaMore.`}
				/>
				<meta property="og:type" content="website" />
			</Head>
			<SectionPageComponent
				sectionData={sectionData}
				departmentCode={departmentCode}
				courseCode={courseCode}
				classCode={classCode}
				evaluationModes={evaluationModes}
			/>
		</>
	);
}
