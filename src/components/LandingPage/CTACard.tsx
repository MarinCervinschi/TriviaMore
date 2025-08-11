import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CTACardProps } from "./types";

export function CTACard({
	title,
	description,
	buttonText,
	buttonHref,
	disclaimer,
}: CTACardProps) {
	return (
		<div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
			<h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
			<p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
			<Link href={buttonHref}>
				<Button size="lg" className="w-full">
					{buttonText}
				</Button>
			</Link>
			{disclaimer && (
				<p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
					{disclaimer}
				</p>
			)}
		</div>
	);
}
