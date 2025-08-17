import { GraduationCap } from "lucide-react";

interface BrowseHeroProps {
	title: string;
	description: string;
}

export function BrowseHero({ title, description }: BrowseHeroProps) {
	return (
		<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<div className="text-center">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
					<GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
				</div>
				<h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
					{title}
				</h1>
				<p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
					{description}
				</p>
			</div>
		</div>
	);
}
