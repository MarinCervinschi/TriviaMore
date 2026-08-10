import { ShieldCheckIcon } from "@solar-icons/react/linear/shield-check";
import { ShieldStarIcon } from "@solar-icons/react/linear/shield-star";
import { ShieldUserIcon } from "@solar-icons/react/linear/shield-user";

import type { Icon } from "@/components/icons";

// Role badge for the admin sidebar: a shield + role label whose colour signals
// the privilege level. Classes are static so Tailwind picks them up; recolour a
// role by editing only its entry below.
export type RoleTheme = {
	label: string;
	icon: Icon;
	pillBg: string;
	pillText: string;
	pillBorder: string;
};

const THEMES = {
	SUPERADMIN: {
		label: "Super Admin",
		icon: ShieldStarIcon,
		pillBg: "bg-violet-500/10",
		pillText: "text-violet-600 dark:text-violet-400",
		pillBorder: "border-violet-500/30",
	},
	ADMIN: {
		label: "Admin",
		icon: ShieldCheckIcon,
		pillBg: "bg-blue-500/10",
		pillText: "text-blue-600 dark:text-blue-400",
		pillBorder: "border-blue-500/30",
	},
	MAINTAINER: {
		label: "Maintainer",
		icon: ShieldUserIcon,
		pillBg: "bg-emerald-500/10",
		pillText: "text-emerald-600 dark:text-emerald-400",
		pillBorder: "border-emerald-500/30",
	},
} satisfies Record<string, RoleTheme>;

export function getRoleTheme(role: string | undefined): RoleTheme {
	if (role === "SUPERADMIN" || role === "ADMIN" || role === "MAINTAINER") {
		return THEMES[role];
	}
	return THEMES.ADMIN;
}
