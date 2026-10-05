import { ShieldCheckIcon } from "@solar-icons/react/linear/shield-check";
import { ShieldStarIcon } from "@solar-icons/react/linear/shield-star";
import { ShieldUserIcon } from "@solar-icons/react/linear/shield-user";
import { UserIcon } from "@solar-icons/react/linear/user";

import type { Icon } from "@/components/icons";

// Static class names, so Tailwind picks them up.
export type RoleTheme = {
	label: string;
	icon: Icon;
	pillBg: string;
	pillText: string;
	pillBorder: string;
	dot: string;
};

const THEMES = {
	SUPERADMIN: {
		label: "Super Admin",
		icon: ShieldStarIcon,
		pillBg: "bg-chart-4/10",
		pillText: "text-chart-4-ink",
		pillBorder: "border-chart-4/30",
		dot: "bg-chart-4",
	},
	ADMIN: {
		label: "Admin",
		icon: ShieldCheckIcon,
		pillBg: "bg-chart-2/10",
		pillText: "text-chart-2-ink",
		pillBorder: "border-chart-2/30",
		dot: "bg-chart-2",
	},
	MAINTAINER: {
		label: "Maintainer",
		icon: ShieldUserIcon,
		pillBg: "bg-chart-3/10",
		pillText: "text-chart-3-ink",
		pillBorder: "border-chart-3/30",
		dot: "bg-chart-3",
	},
	STUDENT: {
		label: "Studente",
		icon: UserIcon,
		pillBg: "bg-chart-1/10",
		pillText: "text-chart-1-ink",
		pillBorder: "border-chart-1/30",
		dot: "bg-chart-1",
	},
} satisfies Record<string, RoleTheme>;

export function getRoleTheme(role: string | undefined): RoleTheme {
	if (
		role === "SUPERADMIN" ||
		role === "ADMIN" ||
		role === "MAINTAINER" ||
		role === "STUDENT"
	) {
		return THEMES[role];
	}
	return THEMES.STUDENT;
}
