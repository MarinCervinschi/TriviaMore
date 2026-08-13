/**
 * The decorative tints of D4, in one place instead of a map per component.
 *
 * These stay on the raw palette on purpose — the categorical ramp was built, compared side by side and
 * rejected on the look. See the addendum under D4. They are therefore theme-constant and outside the
 * contrast gate, which is the price and is accepted.
 *
 * A slot is picked by the caller and carries no meaning: the label and the icon say what the tile is.
 */
export type DecorativeTint = {
	orb: string;
	badge: string;
	icon: string;
	border: string;
	gradient: string;
};

export const DECORATIVE_TINTS: Record<string, DecorativeTint> = {
	amber: {
		orb: "bg-amber-500/10",
		badge: "bg-amber-500/10",
		icon: "text-amber-500",
		border: "border-amber-500/20",
		gradient: "from-amber-500/5 via-card to-card",
	},
	yellow: {
		orb: "bg-yellow-500/10",
		badge: "bg-yellow-500/10",
		icon: "text-yellow-500",
		border: "border-yellow-500/20",
		gradient: "from-yellow-500/5 via-card to-card",
	},
	green: {
		orb: "bg-green-500/10",
		badge: "bg-green-500/10",
		icon: "text-green-500",
		border: "border-green-500/20",
		gradient: "from-green-500/5 via-card to-card",
	},
	blue: {
		orb: "bg-blue-500/10",
		badge: "bg-blue-500/10",
		icon: "text-blue-500",
		border: "border-blue-500/20",
		gradient: "from-blue-500/5 via-card to-card",
	},
	purple: {
		orb: "bg-purple-500/10",
		badge: "bg-purple-500/10",
		icon: "text-purple-500",
		border: "border-purple-500/20",
		gradient: "from-purple-500/5 via-card to-card",
	},
	primary: {
		orb: "bg-primary/10",
		badge: "bg-primary/10",
		icon: "text-brand",
		border: "border-primary/20",
		gradient: "from-primary/5 via-card to-card",
	},
};

export function decorativeTint(name: string | undefined): DecorativeTint {
	return DECORATIVE_TINTS[name ?? ""] ?? DECORATIVE_TINTS.primary;
}
