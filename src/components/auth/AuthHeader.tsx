import React from "react";

import Link from "next/link";

import { ArrowLeft, BookOpen } from "lucide-react";

interface AuthHeaderProps {
	title: string;
	subtitle: string;
	showBackButton?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
	subtitle,
	showBackButton = true,
}) => {
	return (
		<div className="mb-8 text-center">
			{showBackButton && (
				<Link
					href="/"
					className="mb-4 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				>
					<ArrowLeft className="h-4 w-4" />
					Torna alla home
				</Link>
			)}
			<div className="mb-4 flex items-center justify-center gap-2">
				<BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					TriviaMore
				</h1>
			</div>
			<p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
		</div>
	);
};
