import type { ReactNode } from "react";

import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type Common = {
	key: string;
	label: string;
	/** A count beside the label — the size of what the tab holds. */
	badge?: ReactNode;
};

/** A tab is either a route of its own, or a slice of the page you are already on. */
export type TabNavItem = Common &
	({ to: LinkProps["to"] } | { active: boolean; onSelect: () => void });

const TAB =
	"focus-visible:ring-ring relative inline-flex shrink-0 items-center gap-2 px-1 pb-2.5 text-sm whitespace-nowrap transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none";

/**
 * Underlined tabs, for the row under a page's title. Distinct from `Tabs`, which is
 * the enclosed pill set: this one marks the selected item alone and can navigate,
 * so it stands in for sidebar entries a page has absorbed.
 *
 * There is deliberately no rule along the row — over the dot field it reads as
 * neither a boundary nor decoration.
 */
export function TabNav({ label, tabs }: { label: string; tabs: TabNavItem[] }) {
	const matchRoute = useMatchRoute();

	return (
		// Both properties, as `CalendarHeatmap` does: the row scrolls without a bar.
		<div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			<div role="tablist" aria-label={label} className="flex w-max gap-6">
				{tabs.map(tab => {
					const isLink = "to" in tab;
					const current = isLink
						? !!matchRoute({ to: tab.to, fuzzy: false })
						: tab.active;

					const body = (
						<>
							{tab.label}
							{tab.badge !== undefined && (
								<span
									className={cn(
										"text-2xs rounded-md px-1.5 py-0.5 tabular-nums",
										current
											? "bg-muted text-foreground"
											: "bg-muted/60 text-muted-foreground"
									)}
								>
									{tab.badge}
								</span>
							)}
							{/*
							 * A span, not a border: `globals.css` sets `border-color` on `*`
							 * outside any layer, so `border-transparent` never applies.
							 */}
							{current && (
								<span
									aria-hidden
									className="bg-foreground absolute inset-x-0 bottom-0 h-0.5 rounded-full"
								/>
							)}
						</>
					);

					const className = cn(
						TAB,
						current
							? "text-foreground font-semibold"
							: "text-muted-foreground hover:text-foreground"
					);

					return isLink ? (
						<Link
							key={tab.key}
							to={tab.to}
							role="tab"
							aria-selected={current}
							aria-current={current ? "page" : undefined}
							className={className}
						>
							{body}
						</Link>
					) : (
						<button
							key={tab.key}
							type="button"
							role="tab"
							aria-selected={current}
							onClick={tab.onSelect}
							className={className}
						>
							{body}
						</button>
					);
				})}
			</div>
		</div>
	);
}
