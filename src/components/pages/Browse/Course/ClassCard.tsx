import Link from "next/link";

import { BookOpen, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Class {
	id: string;
	name: string;
	code: string;
	description?: string | null;
	courseId: string;
	classYear: number;
	position: number;
	_count: {
		sections: number;
	};
}

interface ClassCardProps {
	class: Class;
	departmentCode: string;
	courseCode: string;
}

export function ClassCard({ class: cls, departmentCode, courseCode }: ClassCardProps) {
	return (
		<Link
			href={`/browse/${departmentCode}/${courseCode}/${cls.code.toLowerCase()}`}
			className="group relative"
		>
			<Card className="h-full border-gray-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
				<CardContent className="p-6">
					<div className="mb-4 flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center space-x-2">
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
								>
									{cls.classYear}° Anno
								</Badge>
								<Badge variant="outline" className="text-xs">
									{cls.code}
								</Badge>
							</div>
							<h3 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
								{cls.name}
							</h3>
						</div>
						<ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-green-600 dark:text-gray-500 dark:group-hover:text-green-400" />
					</div>

					{cls.description && (
						<p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
							{cls.description}
						</p>
					)}

					<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
						<div className="flex items-center space-x-2">
							<BookOpen className="h-4 w-4 text-green-500 dark:text-green-400" />
							<span className="text-sm text-gray-700 dark:text-gray-300">
								{cls._count.sections}{" "}
								{cls._count.sections === 1 ? "sezione" : "sezioni"}
							</span>
						</div>
						<div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/50 dark:text-green-200">
							Anno {cls.classYear}
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
