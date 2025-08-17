import Link from "next/link";

import { BookOpen, ChevronRight } from "lucide-react";

import { DepartmentNode } from "@/lib/types/browse.types";

interface DepartmentCardProps {
	department: DepartmentNode;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
	return (
		<Link href={`/browse/${department.code.toLowerCase()}`} className="group relative">
			<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
				{/* Header */}
				<div className="mb-6 flex items-start justify-between">
					<div className="flex-1">
						<h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
							{department.name}
						</h3>
						<div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
							{department.code}
						</div>
					</div>
					<ChevronRight className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400" />
				</div>

				{/* Description */}
				{department.description && (
					<p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
						{department.description}
					</p>
				)}

				{/* Footer */}
				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{department._count?.courses || 0} corsi
						</span>
					</div>
					<div className="rounded-full bg-blue-50 px-2 py-1 text-xs text-gray-500 dark:bg-blue-900/50 dark:text-gray-400">
						Dipartimento
					</div>
				</div>

				{/* Hover Gradient */}
				<div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/10 dark:to-purple-400/10"></div>
			</div>
		</Link>
	);
}
