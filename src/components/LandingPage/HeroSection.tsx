import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { HeroSectionProps } from "./types";

export function HeroSection({
	title,
	subtitle,
	primaryCTA,
	secondaryCTA,
}: HeroSectionProps) {
	return (
		<section className="py-20">
			<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
				<h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
					{title}
					<span className="text-blue-600"> Interactive Learning</span>
				</h1>
				<p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
					{subtitle}
				</p>
				<div className="flex justify-center gap-4">
					<Link href={primaryCTA.href}>
						<Button size="lg" className="px-8">
							{primaryCTA.text}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href={secondaryCTA.href}>
						<Button size="lg" variant="outline" className="bg-transparent px-8">
							{secondaryCTA.text}
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
