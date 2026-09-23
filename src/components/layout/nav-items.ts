import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
	to: string;
	icon: Icon;
	label: string;
	fuzzy: boolean;
	/**
	 * Nests in the rail: inline when the sidebar is open, in a flyout when it is
	 * collapsed. The first child is the parent's own page, so the row still leads
	 * somewhere if the flyout is dismissed.
	 *
	 * Reach for this only where the parts are separate lists. Where they are views
	 * of one thing — analytics — the page carries a `TabNav` instead and the rail
	 * keeps a single row.
	 */
	children?: Omit<NavItem, "fuzzy">[];
}

/** A page's tab row. The sidebar shows only the first of each set. */
export type TabItem = { key: string; label: string; to: LinkProps["to"] };

/** The only item above the groups: it is where every trail starts. */
export const HOME_ITEM: NavItem = {
	to: "/user",
	icon: HomeIcon,
	label: "Dashboard",
	fuzzy: false,
};

/**
 * What belongs to the student, and the group that comes first — it is what someone
 * signed in opens the app for. Traguardi and Segnalibri are children rather than
 * rows of their own: neither is reached often enough to hold a slot.
 */
export const STUDY_ITEMS: NavItem[] = [
	{
		to: "/user/classes",
		icon: DiplomaIcon,
		label: "I miei insegnamenti",
		fuzzy: false,
	},
	{ to: "/user/analytics", icon: GraphUpIcon, label: "Analytics", fuzzy: true },
	{ to: "/user/bookmarks", icon: BookmarkIcon, label: "Segnalibri", fuzzy: false },
];

/** Tabs on every analytics page, Traguardi included — all read as "come sto andando". */
export const ANALYTICS_TABS: TabItem[] = [
	{ key: "overview", label: "Panoramica", to: "/user/analytics" },
	{ key: "courses", label: "Per corso", to: "/user/analytics/courses" },
	{ key: "history", label: "Storico", to: "/user/analytics/history" },
	{ key: "achievements", label: "Traguardi", to: "/user/achievements" },
];

/** The catalogue — the same pages a guest can reach, hence its own group. */
export const CATALOG_ITEMS: NavItem[] = [
	{ to: "/browse", icon: CompassIcon, label: "Esplora", fuzzy: false },
	{ to: "/search", icon: MagnifierIcon, label: "Cerca", fuzzy: false },
];

/** Something you do rather than consult, so it sits with the tools at the bottom. */
export const REQUESTS_ITEM: NavItem = {
	to: "/user/requests",
	icon: InboxIcon,
	label: "Contributi",
	fuzzy: true,
};

export const ADMIN_ITEM: NavItem = {
	to: "/admin",
	icon: ShieldIcon,
	label: "Gestione",
	fuzzy: true,
};

/** The bottom nav's handful, drawn from the same lists the rail shows. */
export const MOBILE_ITEMS: NavItem[] = [
	HOME_ITEM,
	CATALOG_ITEMS[0]!,
	STUDY_ITEMS[0]!,
	STUDY_ITEMS[1]!,
];

export function useIsAdmin() {
	const { user } = useAuth();
	return (
		user?.role === "SUPERADMIN" || user?.role === "ADMIN" || user?.role === "MAINTAINER"
	);
}

export function getInitials(
	name: string | null | undefined,
	email: string | undefined
) {
	if (name) {
		return name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	return email?.[0]?.toUpperCase() ?? "?";
}
