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
		pillBg: "bg-chart-4/10",
		pillText: "text-chart-4-ink",
		pillBorder: "border-chart-4/30",
	},
	ADMIN: {
		label: "Admin",
		icon: ShieldCheckIcon,
		pillBg: "bg-chart-2/10",
		pillText: "text-chart-2-ink",
		pillBorder: "border-chart-2/30",
	},
	MAINTAINER: {
		label: "Maintainer",
		icon: ShieldUserIcon,
		pillBg: "bg-chart-3/10",
		pillText: "text-chart-3-ink",
		pillBorder: "border-chart-3/30",
	},
} satisfies Record<string, RoleTheme>;

export function getRoleTheme(role: string | undefined): RoleTheme {
	if (role === "SUPERADMIN" || role === "ADMIN" || role === "MAINTAINER") {
		return THEMES[role];
	}
	return THEMES.ADMIN;
}
