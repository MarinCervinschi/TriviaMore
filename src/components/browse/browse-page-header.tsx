import type { ReactNode } from "react";

import type { Icon } from "@/components/icons";
import { IconStack } from "@/components/ui/icon-stack";
import { useAuth } from "@/hooks/useAuth";

import { ExpandableDescription } from "./expandable-description";

export function BrowsePageHeader({
	breadcrumb,
	icon: Icon,
	title,
	description,
	badges,
	stats,
	tabs,
	actions,
}: {
	breadcrumb?: ReactNode;
	icon?: Icon;
	title: string;
	description?: string | null;
	badges?: ReactNode;
	stats?: { label: string; value: number }[];
	/** Takes the place of the stats, for a page whose body switches between views. */
	tabs?: ReactNode;
	actions?: ReactNode;
}) {
	const { isAuthenticated } = useAuth();

	return (
		<section className="relative w-full pt-6 pb-6 sm:pt-8 sm:pb-8">
			<div className="container">
				{/* Signed in, the trail is in the shell header instead. */}
				{!isAuthenticated && breadcrumb}

				{(Icon || actions) && (
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						{Icon ? (
							<IconStack className="shrink-0">
								<Icon className="text-brand h-8 w-8" aria-hidden />
							</IconStack>
						) : (
							<span aria-hidden />
						)}
						{actions && (
							<div className="flex flex-wrap items-center justify-end gap-2">
								{actions}
							</div>
						)}
					</div>
				)}

				<div className="min-w-0">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
						{title}
					</h1>
					{description && (
						<ExpandableDescription
							text={description}
							className="mt-3 max-w-2xl"
							textClassName="text-base sm:text-lg"
						/>
					)}
					{badges && (
						<div className="mt-4 flex flex-wrap items-center gap-2">{badges}</div>
					)}
					{tabs && <div className="mt-6">{tabs}</div>}
					{!tabs && stats && stats.length > 0 && (
						<div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
							{stats.map((stat, i) => (
								<div key={stat.label} className="flex items-center gap-2">
									{i > 0 && (
										<span
											aria-hidden
											className="bg-muted-foreground/30 mr-4 hidden h-1 w-1 rounded-full sm:block"
										/>
									)}
									<span className="text-foreground text-2xl font-bold">
										{stat.value}
									</span>
									<span className="text-muted-foreground text-sm">{stat.label}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
