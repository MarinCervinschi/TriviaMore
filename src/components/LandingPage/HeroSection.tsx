import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { HeroSectionProps } from "./types";

export function HeroSection({
	title,
	subtitle,
	primaryCTA,
	secondaryCTA,
}: HeroSectionProps) {
	return (
		<section className="py-20">
			<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
				<h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
					{title}
				</h1>
				<p className="mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
					{subtitle}
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link href={primaryCTA.href}>
						<Button size="lg" className="w-full px-8 sm:w-auto">
							{primaryCTA.text}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href={secondaryCTA.href}>
						<Button
							size="lg"
							variant="outline"
							className="w-full bg-transparent px-8 sm:w-auto"
						>
							{secondaryCTA.text}
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
