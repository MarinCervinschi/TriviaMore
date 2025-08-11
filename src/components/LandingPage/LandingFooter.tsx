import Link from "next/link";

import { BookOpen } from "lucide-react";

import { FooterSection } from "./types";

interface LandingFooterProps {
	sections: FooterSection[];
}

export function LandingFooter({ sections }: LandingFooterProps) {
	return (
		<footer className="bg-gray-900 py-12 text-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					{/* Brand Section */}
					<div>
						<div className="mb-4 flex items-center gap-2">
							<BookOpen className="h-6 w-6" />
							<span className="text-xl font-bold">TriviaMore</span>
						</div>
						<p className="text-gray-400 dark:text-gray-500">
							Your ultimate study companion for academic success.
						</p>
					</div>

					{/* Dynamic Sections */}
					{sections.map((section, index) => (
						<div key={index}>
							<h4 className="mb-4 font-semibold text-white">{section.title}</h4>
							<ul className="space-y-2 text-gray-400">
								{section.links.map((link, linkIndex) => (
									<li key={linkIndex}>
										<Link href={link.href} className="hover:text-white">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
					<p>&copy; 2024 TriviaMore. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
