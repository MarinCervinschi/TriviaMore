import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { StructureIcon } from "@solar-icons/react/linear/structure";

import type { Icon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
	to: string;
	icon: Icon;
	label: string;
	fuzzy: boolean;
}

export const NAV_ITEMS: NavItem[] = [
	{ to: "/user", icon: HomeIcon, label: "Dashboard", fuzzy: false },
	{ to: "/browse", icon: CompassIcon, label: "Esplora", fuzzy: false },
	{
		to: "/user/classes",
		icon: DiplomaIcon,
		label: "I miei insegnamenti",
		fuzzy: false,
	},
	{ to: "/user/requests", icon: InboxIcon, label: "Contributi", fuzzy: true },
];

export const GRAPH_ITEM: NavItem = {
	to: "/graph",
	icon: StructureIcon,
	label: "Grafo",
	fuzzy: false,
};

export const ABOUT_ITEM: NavItem = {
	to: "/about",
	icon: InfoCircleIcon,
	label: "Chi siamo",
	fuzzy: false,
};

export const ADMIN_ITEM: NavItem = {
	to: "/admin",
	icon: ShieldIcon,
	label: "Gestione",
	fuzzy: true,
};

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
