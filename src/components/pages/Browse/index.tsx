import { DepartmentNode } from "@/lib/types/browse.types";

import { BrowseHero } from "./BrowseHero";
import { BrowseStats } from "./BrowseStats";
import { DepartmentGrid } from "./DepartmentGrid";

interface BrowsePageComponentProps {
	departments?: DepartmentNode[];
}

export default function BrowsePageComponent({ departments }: BrowsePageComponentProps) {
	const totalCourses =
		departments?.reduce((total, dept) => total + (dept._count?.courses || 0), 0) || 0;

	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-8">
				<BrowseHero
					title="Esplora i Contenuti"
					description="Scopri tutti i dipartimenti e i corsi disponibili. Naviga attraverso la struttura accademica per trovare i contenuti che ti interessano."
				/>

				<BrowseStats
					departmentCount={departments?.length || 0}
					totalCourses={totalCourses}
				/>

				<DepartmentGrid departments={departments} />
			</div>
		</div>
	);
}
