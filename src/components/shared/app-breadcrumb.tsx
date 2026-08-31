import { Fragment, useEffect, useRef, useState } from "react";

import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Crumb = {
	label: string;
	/** Absent on the last crumb: the page you are already on. */
	to?: LinkProps["to"];
	params?: Record<string, string>;
	icon?: Icon;
};

export type BreadcrumbSurface = "plain" | "soft" | "outline";
export type BreadcrumbIcons = "none" | "first" | "all";

// Opaque on purpose: the page band's dots run under the breadcrumb.
const SURFACE: Record<BreadcrumbSurface, string> = {
	plain: "",
	soft: "bg-muted rounded-xl px-3 py-1.5",
	outline: "bg-background border-border rounded-xl border px-3 py-1.5 shadow-xs",
};

function CrumbIcon({ crumb, boxed }: { crumb: Crumb; boxed: boolean }) {
	if (!crumb.icon) return null;
	const Glyph = crumb.icon;
	return boxed ? (
		<span className="border-border/60 bg-background inline-flex size-7 items-center justify-center rounded-lg border">
			<Glyph className="size-3.5" />
		</span>
	) : (
		<Glyph className="size-4 shrink-0" />
	);
}

/**
 * Whether the label is actually showing an ellipsis. Measured rather than counted:
 * the cut is `maxLabel` in `ch`, and a `ch` is the width of a zero, so a label of
 * 26 narrow characters still fits inside 22ch. Counting characters put a tooltip
 * on names that were rendering in full.
 */
function useIsClipped<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [clipped, setClipped] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		// A pixel of tolerance: sub-pixel rounding otherwise reports a clip that is not there.
		const measure = () => setClipped(node.scrollWidth > node.clientWidth + 1);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return () => observer.disconnect();
	}, [ref]);

	return [ref, clipped] as const;
}

function CrumbBody({
	crumb,
	boxed,
	maxLabel,
}: {
	crumb: Crumb;
	boxed: boolean;
	maxLabel: number;
}) {
	const [labelRef, clipped] = useIsClipped<HTMLSpanElement>();

	const body = (
		<span className="inline-flex min-w-0 items-center gap-1.5">
			<CrumbIcon crumb={crumb} boxed={boxed} />
			{/* `ch` cuts by character while still respecting the font's own metrics. */}
			<span ref={labelRef} className="truncate" style={{ maxWidth: `${maxLabel}ch` }}>
				{crumb.label}
			</span>
		</span>
	);

	if (!clipped) return body;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{body}</TooltipTrigger>
			<TooltipContent className="max-w-72">{crumb.label}</TooltipContent>
		</Tooltip>
	);
}

/**
 * The one breadcrumb. Past `maxItems` the middle collapses into a menu instead of
 * wrapping onto a second line — the catalogue's names are long enough that a
 * five-level trail would otherwise take two rows on a laptop.
 */
export function AppBreadcrumb({
	items,
	maxItems = 4,
	maxLabel = 22,
	surface = "outline",
	icons = "all",
	boxedFirstIcon = false,
	className,
}: {
	items: Crumb[];
	/** Visible slots, the menu counted: 4 keeps the first, the dots and two names. */
	maxItems?: number;
	/** Characters a label may take before it is cut; the full name lands in a tooltip. */
	maxLabel?: number;
	surface?: BreadcrumbSurface;
	icons?: BreadcrumbIcons;
	/** Draws the first crumb's icon in its own bordered square. */
	boxedFirstIcon?: boolean;
	className?: string;
}) {
	const shown = items.map((crumb, index) => ({
		...crumb,
		icon:
			icons === "all" || (icons === "first" && index === 0) ? crumb.icon : undefined,
	}));

	const collapse = shown.length > maxItems;
	const head = collapse ? shown.slice(0, 1) : shown;
	const hidden = collapse ? shown.slice(1, shown.length - (maxItems - 2)) : [];
	const tail = collapse ? shown.slice(shown.length - (maxItems - 2)) : [];

	const pieces = [
		...head.map(crumb => (
			<Piece
				key={crumb.label}
				crumb={crumb}
				boxed={boxedFirstIcon}
				maxLabel={maxLabel}
			/>
		)),
		...(collapse
			? [
					<DropdownMenu key="__menu">
						<DropdownMenuTrigger
							aria-label="Mostra i livelli nascosti"
							className="hover:text-foreground hover:bg-muted rounded-md transition-colors"
						>
							<BreadcrumbEllipsis className="h-5 w-6" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="min-w-48">
							{hidden.map(crumb => (
								<DropdownMenuItem key={crumb.label} asChild>
									{crumb.to ? (
										<Link to={crumb.to} params={crumb.params as never}>
											{crumb.label}
										</Link>
									) : (
										<span>{crumb.label}</span>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>,
				]
			: []),
		...tail.map(crumb => (
			<Piece key={crumb.label} crumb={crumb} boxed={false} maxLabel={maxLabel} />
		)),
	];

	return (
		<TooltipProvider delayDuration={200}>
			<Breadcrumb className={cn("inline-flex max-w-full", SURFACE[surface], className)}>
				<BreadcrumbList className="flex-nowrap gap-1.5 sm:gap-2">
					{pieces.map((piece, index) => (
						<Fragment key={index}>
							<BreadcrumbItem className="min-w-0">{piece}</BreadcrumbItem>
							{index < pieces.length - 1 && <BreadcrumbSeparator />}
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</TooltipProvider>
	);
}

function Piece({
	crumb,
	boxed,
	maxLabel,
}: {
	crumb: Crumb;
	boxed: boolean;
	maxLabel: number;
}) {
	if (!crumb.to) {
		return (
			<BreadcrumbPage className="min-w-0 font-medium">
				<CrumbBody crumb={crumb} boxed={boxed} maxLabel={maxLabel} />
			</BreadcrumbPage>
		);
	}
	return (
		<Link
			to={crumb.to}
			params={crumb.params as never}
			className="hover:text-foreground min-w-0 transition-colors"
		>
			<CrumbBody crumb={crumb} boxed={boxed} maxLabel={maxLabel} />
		</Link>
	);
}
