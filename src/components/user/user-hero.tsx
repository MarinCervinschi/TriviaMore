import type { ReactNode } from "react";

import type { Icon } from "@/components/icons";
import { IconStack } from "@/components/ui/icon-stack";

export function UserHero({
	icon: Icon,
	title,
	description,
	stats,
	children,
}: {
	icon: Icon;
	title: string;
	description: string;
	stats?: { label: string; value: string | number }[];
	children?: ReactNode;
}) {
	return (
		<section className="relative w-full py-12 sm:py-16">
			<div className="container">
				{children ? (
					children
				) : (
					<>
						<IconStack className="mb-3">
							<Icon className="text-brand h-8 w-8" />
						</IconStack>
						<h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							{title}
						</h1>
						<p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
					</>
				)}

				{stats && stats.length > 0 && (
					<div className="mt-6 flex flex-wrap items-center gap-6">
						{stats.map((stat, i) => (
							<div key={stat.label} className="flex items-center gap-2">
								{i > 0 && (
									<span className="bg-muted-foreground/30 mr-4 hidden h-1 w-1 rounded-full sm:block" />
								)}
								<span className="text-foreground text-2xl font-bold">{stat.value}</span>
								<span className="text-muted-foreground text-sm">{stat.label}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
