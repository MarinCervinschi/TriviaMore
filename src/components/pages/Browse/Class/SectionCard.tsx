import Link from "next/link";

import { ChevronRight, FileText, Globe, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Section {
	id: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	position: number;
	classId: string;
	_count: {
		questions: number;
	};
}

interface SectionCardProps {
	section: Section;
	departmentCode: string;
	courseCode: string;
	classCode: string;
}

export default function SectionCard({
	section,
	departmentCode,
	courseCode,
	classCode,
}: SectionCardProps) {
	// Converti il nome della sezione in lowercase per l'URL
	const sectionUrlName = section.name.toLowerCase().replace(/\s+/g, "-");

	return (
		<Link
			href={`/browse/${departmentCode}/${courseCode}/${classCode}/${sectionUrlName}`}
			className="group relative"
		>
			<Card className="h-full border-gray-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
				<CardContent className="p-6">
					<div className="mb-4 flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center space-x-2">
								<Badge
									variant={section.isPublic ? "secondary" : "outline"}
									className={
										section.isPublic
											? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
											: "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300"
									}
								>
									{section.isPublic ? (
										<>
											<Globe className="mr-1 h-3 w-3" />
											Pubblica
										</>
									) : (
										<>
											<Lock className="mr-1 h-3 w-3" />
											Privata
										</>
									)}
								</Badge>
							</div>
							<h3 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
								{section.name}
							</h3>
						</div>
						<ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-green-600 dark:text-gray-500 dark:group-hover:text-green-400" />
					</div>

					{section.description && (
						<p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
							{section.description}
						</p>
					)}

					<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
						<div className="flex items-center space-x-2">
							<FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
							<span className="text-sm text-gray-700 dark:text-gray-300">
								{section._count.questions}{" "}
								{section._count.questions === 1 ? "domanda" : "domande"}
							</span>
						</div>
						<div
							className={`rounded-full px-2 py-1 text-xs ${
								section.isPublic
									? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
									: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
							}`}
						>
							{section.isPublic ? "Accesso libero" : "Accesso limitato"}
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
