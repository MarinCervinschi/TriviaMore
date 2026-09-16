import { useId } from "react";

import { BoltIcon } from "@solar-icons/react/bold/bolt";
import { BookmarkIcon } from "@solar-icons/react/bold/bookmark";
import { CalendarIcon } from "@solar-icons/react/bold/calendar";
import { CardholderIcon } from "@solar-icons/react/bold/cardholder";
import { ClockCircleIcon } from "@solar-icons/react/bold/clock-circle";
import { CompassIcon } from "@solar-icons/react/bold/compass";
import { DiplomaVerifiedIcon } from "@solar-icons/react/bold/diploma-verified";
import { FireIcon } from "@solar-icons/react/bold/fire";
import { GlobalIcon } from "@solar-icons/react/bold/global";
import { GraphUpIcon } from "@solar-icons/react/bold/graph-up";
import { HandHeartIcon } from "@solar-icons/react/bold/hand-heart";
import { MapIcon } from "@solar-icons/react/bold/map";
import { MedalStarIcon } from "@solar-icons/react/bold/medal-star";
import { StarIcon } from "@solar-icons/react/bold/star";

import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

// All three maps fall back rather than throw: a badge added from the SQL
// console with an unmapped key still has to render.
const ICONS: Record<string, Icon> = {
	bolt: BoltIcon,
	bookmark: BookmarkIcon,
	calendar: CalendarIcon,
	cardholder: CardholderIcon,
	"clock-circle": ClockCircleIcon,
	compass: CompassIcon,
	"diploma-verified": DiplomaVerifiedIcon,
	fire: FireIcon,
	global: GlobalIcon,
	"graph-up": GraphUpIcon,
	"hand-heart": HandHeartIcon,
	map: MapIcon,
	"medal-star": MedalStarIcon,
	star: StarIcon,
};

// Generated offline and kept as constants: trigonometry at render differs in the
// last bit between container and browser, which breaks hydration.
const SHAPES: Record<string, string> = {
	seal: "M50.0,10.0 A10.35,10.35 0 0 1 70.0,15.36 A10.35,10.35 0 0 1 84.64,30.0 A10.35,10.35 0 0 1 90.0,50.0 A10.35,10.35 0 0 1 84.64,70.0 A10.35,10.35 0 0 1 70.0,84.64 A10.35,10.35 0 0 1 50.0,90.0 A10.35,10.35 0 0 1 30.0,84.64 A10.35,10.35 0 0 1 15.36,70.0 A10.35,10.35 0 0 1 10.0,50.0 A10.35,10.35 0 0 1 15.36,30.0 A10.35,10.35 0 0 1 30.0,15.36 A10.35,10.35 0 0 1 50.0,10.0 Z",
	shield: "M50,6 L88,20 C88,52 76,78 50,94 C24,78 12,52 12,20 Z",
	burst:
		"M50.0,4.0 L60.52,17.63 L77.04,12.79 L77.54,29.99 L93.75,35.79 L84.04,50.0 L93.75,64.21 L77.54,70.01 L77.04,87.21 L60.52,82.37 L50.0,96.0 L39.48,82.37 L22.96,87.21 L22.46,70.01 L6.25,64.21 L15.96,50.0 L6.25,35.79 L22.46,29.99 L22.96,12.79 L39.48,17.63 Z",
	hex: "M40.47,9.5 Q50.0,4.0 59.53,9.5 L80.31,21.5 Q89.84,27.0 89.84,38.0 L89.84,62.0 Q89.84,73.0 80.31,78.5 L59.53,90.5 Q50.0,96.0 40.47,90.5 L19.69,78.5 Q10.16,73.0 10.16,62.0 L10.16,38.0 Q10.16,27.0 19.69,21.5 Z",
	plaque: "M50,5 L84,17 L84,51 C84,73 68,85 50,94 C32,85 16,73 16,51 L16,17 Z",
	ribbon:
		"M18,10 L82,10 A8,8 0 0 1 90,18 L90,64 A8,8 0 0 1 82,72 L64,72 L50,86 L36,72 L18,72 A8,8 0 0 1 10,64 L10,18 A8,8 0 0 1 18,10 Z",
	diamond:
		"M41.51,13.49 Q50.0,5.0 58.49,13.49 L86.51,41.51 Q95.0,50.0 86.51,58.49 L58.49,86.51 Q50.0,95.0 41.51,86.51 L13.49,58.49 Q5.0,50.0 13.49,41.51 Z",
};

type Accent = {
	ink: string;
	fill: string;
	numeral: string;
	stroke: string;
};

// The glyph is `text-card`, never a white literal: white measures 2.83 on
// chart-3 in dark and fails 1.4.11's 3:1, while `card` flips with the theme.
const ACCENTS: Record<string, Accent> = {
	"chart-1": {
		ink: "text-chart-1-ink",
		fill: "text-chart-1",
		numeral: "bg-chart-1-ink",
		stroke: "stroke-chart-1-ink",
	},
	"chart-2": {
		ink: "text-chart-2-ink",
		fill: "text-chart-2",
		numeral: "bg-chart-2-ink",
		stroke: "stroke-chart-2-ink",
	},
	"chart-3": {
		ink: "text-chart-3-ink",
		fill: "text-chart-3",
		numeral: "bg-chart-3-ink",
		stroke: "stroke-chart-3-ink",
	},
	"chart-4": {
		ink: "text-chart-4-ink",
		fill: "text-chart-4",
		numeral: "bg-chart-4-ink",
		stroke: "stroke-chart-4-ink",
	},
	"chart-5": {
		ink: "text-chart-5-ink",
		fill: "text-chart-5",
		numeral: "bg-chart-5-ink",
		stroke: "stroke-chart-5-ink",
	},
	brand: {
		ink: "text-brand",
		fill: "text-brand",
		numeral: "bg-brand",
		stroke: "stroke-brand",
	},
	muted: {
		ink: "text-muted-foreground",
		fill: "text-muted-foreground",
		numeral: "bg-muted-foreground",
		stroke: "stroke-muted-foreground",
	},
};

function achievementIcon(icon: string): Icon {
	return ICONS[icon] ?? MedalStarIcon;
}

function achievementShape(shape: string): string {
	return SHAPES[shape] ?? SHAPES.seal!;
}

function achievementAccent(accent: string): Accent {
	return ACCENTS[accent] ?? ACCENTS.brand!;
}

export function achievementInk(accent: string): string {
	return achievementAccent(accent).ink;
}

export function achievementStroke(accent: string): string {
	return achievementAccent(accent).stroke;
}

const TIER_NUMERAL: Record<number, string> = { 2: "II", 3: "III" };

const SIZES = {
	sm: { box: "size-10", glyph: "size-4", numeral: "size-4 text-[9px]" },
	md: { box: "size-12", glyph: "size-[18px]", numeral: "size-5 text-[10px]" },
	lg: { box: "size-14", glyph: "size-5", numeral: "size-6 text-[11px]" },
	xl: { box: "size-[72px]", glyph: "size-7", numeral: "size-7 text-[12px]" },
	"2xl": { box: "size-24", glyph: "size-10", numeral: "size-8 text-sm" },
} as const;

export type AchievementMedalProps = {
	icon: string;
	accent: string;
	shape: string;
	tier?: number;
	locked?: boolean;
	size?: keyof typeof SIZES;
	className?: string;
};

/**
 * A silhouette per category, lit from the top left; a locked one keeps the same
 * shape in grey, and its glyph, because a padlock would hide what the goal is.
 */
export function AchievementMedal({
	icon,
	accent,
	shape,
	tier = 1,
	locked = false,
	size = "md",
	className,
}: AchievementMedalProps) {
	const Glyph = achievementIcon(icon);
	const path = achievementShape(shape);
	const accentClasses = achievementAccent(accent);
	const dimensions = SIZES[size];
	const numeral = TIER_NUMERAL[tier];
	const glossId = `${useId()}-gloss`;

	return (
		<span
			className={cn(
				"relative inline-flex shrink-0",
				dimensions.box,
				locked ? "text-muted-foreground/25" : accentClasses.fill,
				className
			)}
		>
			<svg viewBox="0 0 100 100" className="size-full" aria-hidden>
				<path d={path} fill="currentColor" />
				{!locked && (
					<>
						<defs>
							<radialGradient id={glossId} cx="32%" cy="24%" r="64%">
								<stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
								<stop offset="45%" stopColor="#fff" stopOpacity="0.16" />
								<stop offset="100%" stopColor="#fff" stopOpacity="0" />
							</radialGradient>
						</defs>
						<path d={path} fill={`url(#${glossId})`} />
					</>
				)}
			</svg>

			<span
				className={cn(
					"absolute inset-0 grid place-items-center",
					// Solid: at /70 the glyph measured 2.02:1 on its own silhouette, under 3:1.
					locked ? "text-muted-foreground" : "text-card"
				)}
			>
				<Glyph className={dimensions.glyph} />
			</span>

			{numeral && !locked && (
				<span
					className={cn(
						// A ring: `globals.css` sets `border-color` on `*` outside any layer.
						"text-card ring-card absolute -right-0.5 -bottom-0.5 inline-flex items-center justify-center rounded-full font-medium tabular-nums ring-2",
						accentClasses.numeral,
						dimensions.numeral
					)}
				>
					{numeral}
				</span>
			)}
		</span>
	);
}
