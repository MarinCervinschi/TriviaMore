// On the raw palette on purpose, so these are theme-constant and outside the contrast gate.
export type DecorativeTint = {
	badge: string;
	icon: string;
	border: string;
	gradient: string;
};

export const DECORATIVE_TINTS: Record<string, DecorativeTint> = {
	amber: {
		badge: "bg-amber-500/10",
		icon: "text-amber-500",
		border: "border-amber-500/20",
		gradient: "from-amber-500/5 via-card to-card",
	},
	yellow: {
		badge: "bg-yellow-500/10",
		icon: "text-yellow-500",
		border: "border-yellow-500/20",
		gradient: "from-yellow-500/5 via-card to-card",
	},
	green: {
		badge: "bg-green-500/10",
		icon: "text-green-500",
		border: "border-green-500/20",
		gradient: "from-green-500/5 via-card to-card",
	},
	blue: {
		badge: "bg-blue-500/10",
		icon: "text-blue-500",
		border: "border-blue-500/20",
		gradient: "from-blue-500/5 via-card to-card",
	},
	purple: {
		badge: "bg-purple-500/10",
		icon: "text-purple-500",
		border: "border-purple-500/20",
		gradient: "from-purple-500/5 via-card to-card",
	},
	primary: {
		badge: "bg-primary/10",
		icon: "text-brand",
		border: "border-primary/20",
		gradient: "from-primary/5 via-card to-card",
	},
};

export function decorativeTint(name: string | undefined): DecorativeTint {
	return DECORATIVE_TINTS[name ?? ""] ?? DECORATIVE_TINTS.primary;
}
