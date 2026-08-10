import type { ReactNode } from "react";

import type { Icon } from "@/components/icons";

import { ExpandableDescription } from "./expandable-description";

export function BrowsePageHeader({
	breadcrumb,
	icon: Icon,
	title,
	description,
	badges,
	stats,
	actions,
}: {
	breadcrumb?: ReactNode;
	icon?: Icon;
	title: string;
	description?: string | null;
	badges?: ReactNode;
	stats?: { label: string; value: number }[];
	actions?: ReactNode;
}) {
	return (
		<section className="relative w-full pt-6 pb-10 sm:pt-8 sm:pb-14">
			<div className="container">
				{breadcrumb}

				{/* Top row: icon left, actions right. On mobile, actions wrap below
            so the title block underneath always has full width and never gets
            squeezed by buttons. */}
				{(Icon || actions) && (
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						{Icon ? (
							<div className="bg-primary/10 inline-flex shrink-0 rounded-2xl p-3">
								<Icon className="text-primary h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
							</div>
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
					{stats && stats.length > 0 && (
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
