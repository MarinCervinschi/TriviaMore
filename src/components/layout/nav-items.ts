import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import type { LinkProps } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
	to: string;
	icon: Icon;
	label: string;
	fuzzy: boolean;
	/** The first child is the parent's own page. */
	children?: Omit<NavItem, "fuzzy">[];
}

/** A page's tab row; the sidebar shows only the first of each set. */
export type TabItem = { key: string; label: string; to: LinkProps["to"] };

export const HOME_ITEM: NavItem = {
	to: "/user",
	icon: HomeIcon,
	label: "Dashboard",
	fuzzy: false,
};

export const STUDY_ITEMS: NavItem[] = [
	{
		to: "/user/classes",
		icon: DiplomaIcon,
		label: "I miei insegnamenti",
		fuzzy: false,
	},
	{ to: "/user/career", icon: NotebookIcon, label: "Carriera", fuzzy: true },
	{ to: "/user/calendar", icon: CalendarIcon, label: "Calendario", fuzzy: false },
	{ to: "/user/analytics", icon: GraphUpIcon, label: "Analytics", fuzzy: true },
	{ to: "/user/bookmarks", icon: BookmarkIcon, label: "Segnalibri", fuzzy: false },
];

export const ANALYTICS_TABS: TabItem[] = [
	{ key: "overview", label: "Panoramica", to: "/user/analytics" },
	{ key: "courses", label: "Per corso", to: "/user/analytics/courses" },
	{ key: "history", label: "Storico", to: "/user/analytics/history" },
	{ key: "achievements", label: "Traguardi", to: "/user/achievements" },
];

export const CAREER_TABS: TabItem[] = [
	{ key: "overview", label: "Panoramica", to: "/user/career" },
	{ key: "exams", label: "Libretto", to: "/user/career/exams" },
	{ key: "forecast", label: "Previsione", to: "/user/career/forecast" },
];

export const CATALOG_ITEMS: NavItem[] = [
	{ to: "/browse", icon: CompassIcon, label: "Esplora", fuzzy: false },
	{ to: "/search", icon: MagnifierIcon, label: "Cerca", fuzzy: false },
];

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

export const MOBILE_ITEMS: NavItem[] = [
	HOME_ITEM,
	CATALOG_ITEMS[0]!,
	STUDY_ITEMS[0]!,
	STUDY_ITEMS[3]!,
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
