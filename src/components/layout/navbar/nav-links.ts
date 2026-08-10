import { BookIcon } from "@solar-icons/react/linear/book";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { FeedIcon } from "@solar-icons/react/linear/feed";
import { HomeIcon } from "@solar-icons/react/linear/home";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { LetterIcon } from "@solar-icons/react/linear/letter";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { StructureIcon } from "@solar-icons/react/linear/structure";
import { UserIcon } from "@solar-icons/react/linear/user";

import type { Icon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export type NavLinkItem = {
	type: "link";
	to: string;
	label: string;
	icon?: Icon;
};
export type NavDropdownItem = {
	type: "dropdown";
	label: string;
	to?: string;
	icon?: Icon;
	children: { to: string; label: string; icon?: Icon; description?: string }[];
};
export type NavItem = NavLinkItem | NavDropdownItem;

const EXPLORE_DROPDOWN: NavDropdownItem = {
	type: "dropdown",
	label: "Esplora",
	to: "/browse",
	icon: CompassIcon,
	children: [
		{
			to: "/search/courses",
			label: "Cerca corso",
			icon: DiplomaIcon,
			description: "Trova un corso per nome",
		},
		{
			to: "/search/classes",
			label: "Cerca insegnamento",
			icon: BookIcon,
			description: "Trova un insegnamento per nome",
		},
	],
};

export const GUEST_NAV_ITEMS: NavItem[] = [
	EXPLORE_DROPDOWN,
	{ type: "link", to: "/about", label: "Chi siamo", icon: InfoCircleIcon },
	{ type: "link", to: "/contact", label: "Contatti", icon: LetterIcon },
	{ type: "link", to: "/graph", label: "Grafo", icon: StructureIcon },
	{ type: "link", to: "/news", label: "Novità", icon: FeedIcon },
];

export const AUTH_NAV_ITEMS: NavItem[] = [
	{ type: "link", to: "/user", label: "Il mio profilo", icon: HomeIcon },
	EXPLORE_DROPDOWN,
	{ type: "link", to: "/graph", label: "Grafo", icon: StructureIcon },
	{ type: "link", to: "/user/classes", label: "I miei corsi", icon: DiplomaIcon },
];

export const ADMIN_NAV_ITEM: NavLinkItem = {
	type: "link",
	to: "/admin",
	label: "Gestione",
	icon: ShieldIcon,
};

export const USER_MENU_LINKS: NavLinkItem[] = [
	{ type: "link", to: "/user", label: "Il mio profilo", icon: UserIcon },
	{ type: "link", to: "/news", label: "Novità", icon: FeedIcon },
	{ type: "link", to: "/contact", label: "Contatti", icon: LetterIcon },
	{ type: "link", to: "/user/settings", label: "Impostazioni", icon: SettingsIcon },
];

export function useNavItems() {
	const { isAuthenticated, user } = useAuth();
	const isAdmin =
		user?.role === "SUPERADMIN" ||
		user?.role === "ADMIN" ||
		user?.role === "MAINTAINER";

	if (!isAuthenticated) return GUEST_NAV_ITEMS;
	if (isAdmin) return [...AUTH_NAV_ITEMS, ADMIN_NAV_ITEM];
	return AUTH_NAV_ITEMS;
}
