import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { AppBreadcrumb, type Crumb } from "@/components/shared/app-breadcrumb";

export interface BreadcrumbSegment {
	label: string;
	href: string;
}

/** One glyph per level of the catalogue, in the order the routes nest them. */
const LEVEL_ICONS: Icon[] = [
	CompassIcon,
	BuildingsIcon,
	DiplomaIcon,
	BookIcon,
	DocumentTextIcon,
];

export function BrowseBreadcrumb({
	segments,
	current,
}: {
	segments: BreadcrumbSegment[];
	current: string;
}) {
	// No home crumb here: these pages are public, and a guest has no dashboard to
	// go back to — the trail starts where the catalogue does.
	const items: Crumb[] = [
		...segments.map((segment, index) => ({
			label: segment.label,
			to: segment.href as LinkProps["to"],
			icon: LEVEL_ICONS[index],
		})),
		{ label: current, icon: LEVEL_ICONS[segments.length] },
	];

	return <AppBreadcrumb items={items} className="mb-6" />;
}
