import { BookOpen } from "lucide-react";

import { DepartmentNode } from "@/lib/types/browse.types";

import { DepartmentCard } from "./DepartmentCard";

interface DepartmentGridProps {
	departments?: DepartmentNode[];
}

export function DepartmentGrid({ departments }: DepartmentGridProps) {
	if (!departments || departments.length === 0) {
		return (
			<div className="py-16 text-center">
				<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
					<BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
				</div>
				<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
					Nessun dipartimento trovato
				</h3>
				<p className="text-gray-600 dark:text-gray-400">
					Al momento non ci sono dipartimenti disponibili.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{departments.map(department => (
				<DepartmentCard key={department.id} department={department} />
			))}
		</div>
	);
}
