import Link from "next/link";

import { ChevronRight, FileText, Globe, Lock } from "lucide-react";

import SectionCardSkeleton from "@/components/pages/Browse/Section/SectionCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSectionAccess } from "@/providers/section-access-provider";

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
	const { canAccessSection, isLoading } = useSectionAccess();

	if (isLoading) {
		return <SectionCardSkeleton />;
	}

	const canAccess = canAccessSection(section.id, section.isPublic);

	const sectionUrlName = section.name.toLowerCase().replace(/\s+/g, "-");

	const cardContent = (
		<Card
			className={`h-full border-gray-100 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
				canAccess
					? "cursor-pointer hover:scale-[1.02] hover:shadow-xl"
					: "cursor-not-allowed opacity-60"
			}`}
		>
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
							{!canAccess && (
								<Badge variant="destructive" className="text-xs">
									Accesso negato
								</Badge>
							)}
						</div>
						<h3
							className={`mb-1 font-bold transition-colors ${
								canAccess
									? "text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400"
									: "text-gray-500 dark:text-gray-500"
							}`}
						>
							{section.name}
						</h3>
					</div>
					<ChevronRight
						className={`h-5 w-5 transition-all duration-300 ${
							canAccess
								? "text-gray-400 group-hover:translate-x-1 group-hover:text-green-600 dark:text-gray-500 dark:group-hover:text-green-400"
								: "text-gray-300 dark:text-gray-600"
						}`}
					/>
				</div>

				{section.description && (
					<p
						className={`mb-4 line-clamp-3 text-sm ${
							canAccess
								? "text-gray-600 dark:text-gray-300"
								: "text-gray-400 dark:text-gray-500"
						}`}
					>
						{section.description}
					</p>
				)}

				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<FileText
							className={`h-4 w-4 ${
								canAccess
									? "text-blue-500 dark:text-blue-400"
									: "text-gray-400 dark:text-gray-500"
							}`}
						/>
						<span
							className={`text-sm ${
								canAccess
									? "text-gray-700 dark:text-gray-300"
									: "text-gray-400 dark:text-gray-500"
							}`}
						>
							{section._count.questions}{" "}
							{section._count.questions === 1 ? "domanda" : "domande"}
						</span>
					</div>
					<div
						className={`rounded-full px-2 py-1 text-xs ${
							canAccess
								? section.isPublic
									? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
									: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
								: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
						}`}
					>
						{canAccess
							? section.isPublic
								? "Accesso libero"
								: "Accesso limitato"
							: "Nessun accesso"}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	if (canAccess) {
		return (
			<Link
				href={`/browse/${departmentCode}/${courseCode}/${classCode}/${sectionUrlName}`}
				className="group relative"
			>
				{cardContent}
			</Link>
		);
	}

	return <div className="relative">{cardContent}</div>;
}
