"use client";

import { useState } from "react";

import ClassBreadcrumb from "./ClassBreadcrumb";
import ClassFilters from "./ClassFilters";
import ClassHeader from "./ClassHeader";
import ClassSections from "./ClassSections";
import ExamSimulationButton from "./ExamSimulationButton";

interface Section {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	_count: {
		questions: number;
		quizQuestions: number;
		flashcardQuestions: number;
	};
}

interface EvaluationMode {
	id: string;
	name: string;
	description?: string | null;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

interface ClassData {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseId: string;
	classYear: number;
	position: number;
	isEnrolled?: boolean;
	course: {
		id: string;
		name: string;
		code: string;
		description?: string | null;
		courseType: "BACHELOR" | "MASTER";
		position: number;
		departmentId: string;
		department: {
			id: string;
			name: string;
			code: string;
		};
	};
	_count: {
		sections: number;
	};
	sections: Section[];
}

interface ClassPageComponentProps {
	classData: ClassData;
	filters: {
		search?: string;
	};
	departmentCode: string;
	courseCode: string;
	isUserLoggedIn: boolean;
	evaluationModes: EvaluationMode[];
}

export default function ClassPageComponent({
	classData,
	filters,
	departmentCode,
	courseCode,
	isUserLoggedIn,
	evaluationModes,
}: ClassPageComponentProps) {
	const [searchQuery, setSearchQuery] = useState(filters.search || "");

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		// Aggiorna URL con il nuovo filtro di ricerca
		const params = new URLSearchParams();
		if (query) {
			params.set("search", query);
		}
		window.history.pushState(
			{},
			"",
			`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
		);
	};

	// Filtra le sezioni localmente se c'è una query di ricerca
	const filteredSections = searchQuery
		? classData.sections.filter(
				section =>
					section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					section.description?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: classData.sections;

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<ClassBreadcrumb
					department={classData.course.department}
					course={classData.course}
					classData={classData}
					departmentCode={departmentCode}
					courseCode={courseCode}
				/>

				<ClassHeader
					classData={classData}
					totalSections={filteredSections.length}
					totalQuestions={filteredSections.reduce(
						(acc, section) => acc + section._count.questions,
						0
					)}
					isEnrolled={classData.isEnrolled}
				/>

				<ExamSimulationButton
					classData={classData}
					isUserLoggedIn={isUserLoggedIn}
					evaluationModes={evaluationModes}
				/>

				<ClassFilters
					searchQuery={searchQuery}
					onSearchChange={handleSearch}
					totalResults={filteredSections.length}
				/>

				<ClassSections
					sections={filteredSections}
					departmentCode={departmentCode}
					courseCode={courseCode}
					classCode={classData.code.toLowerCase()}
					isUserLoggedIn={isUserLoggedIn}
				/>
			</div>
		</div>
	);
}
