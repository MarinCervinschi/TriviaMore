import type { AchievementView, AchievementsOverview } from "@/lib/achievements/types";

const BASE = {
	category: "Esplorazione",
	shape: "seal",
	awardedAt: null,
	progress: null,
	pinPosition: null,
} satisfies Partial<AchievementView>;

// Fixed: a story that re-dates itself cannot be compared against the one beside it.
export const UNLOCKED_AT = "2026-09-04T10:20:00.000Z";

export const ACHIEVEMENTS: AchievementView[] = [
	{
		...BASE,
		key: "explorer_2",
		family: "explorer",
		tier: 2,
		name: "Esploratore",
		description: "Completa un quiz in 10 sezioni diverse.",
		metric: "DISTINCT_SECTIONS",
		shape: "seal",
		icon: "compass",
		accent: "chart-2",
		awardedAt: UNLOCKED_AT,
	},
	{
		...BASE,
		key: "explorer_3",
		family: "explorer",
		tier: 3,
		name: "Cartografo",
		description: "Completa un quiz in 25 sezioni diverse.",
		metric: "DISTINCT_SECTIONS",
		shape: "seal",
		icon: "compass",
		accent: "chart-2",
		progress: { value: 14, target: 25, ratio: 14 / 25 },
	},
	{
		...BASE,
		category: "Padronanza",
		key: "perfect_1",
		family: "perfect",
		tier: 1,
		name: "Trentatré",
		description: "Chiudi un quiz con voto pieno su almeno 10 domande.",
		metric: "PERFECT_QUIZZES",
		shape: "shield",
		icon: "medal-star",
		accent: "chart-3",
	},
	{
		...BASE,
		category: "Ritmo",
		key: "hours_2",
		family: "hours",
		tier: 2,
		name: "Ore di volo",
		description: "Accumula 10 ore di studio.",
		metric: "TOTAL_TIME_MS",
		shape: "hex",
		icon: "clock-circle",
		accent: "chart-5",
		progress: { value: 11_536_021, target: 36_000_000, ratio: 11_536_021 / 36_000_000 },
	},
	{
		...BASE,
		category: "Contributo",
		key: "contributor_3",
		family: "contributor",
		tier: 3,
		name: "Pilastro",
		description: "Vedi approvate 15 proposte di contenuto.",
		metric: "APPROVED_REQUESTS",
		shape: "ribbon",
		icon: "hand-heart",
		accent: "brand",
		progress: { value: 2, target: 15, ratio: 2 / 15 },
	},
	{
		...BASE,
		category: "Origine",
		key: "founder_1",
		family: "founder",
		tier: 1,
		name: "Dei primi",
		description: "Sei fra i primi 100 iscritti a TriviaMore.",
		metric: "SIGNUP_RANK",
		shape: "diamond",
		icon: "star",
		accent: "muted",
		awardedAt: UNLOCKED_AT,
	},
];

/** Every icon key the v1 catalogue uses. */
export const CATALOGUE_ICONS: {
	icon: string;
	accent: string;
	shape: string;
	label: string;
}[] = [
	{ icon: "compass", shape: "seal", accent: "chart-2", label: "explorer" },
	{ icon: "map", shape: "seal", accent: "chart-2", label: "classes" },
	{ icon: "global", shape: "seal", accent: "chart-2", label: "wanderer" },
	{ icon: "medal-star", shape: "shield", accent: "chart-3", label: "perfect" },
	{ icon: "bolt", shape: "shield", accent: "chart-3", label: "hard" },
	{ icon: "diploma-verified", shape: "shield", accent: "chart-3", label: "exam" },
	{ icon: "graph-up", shape: "burst", accent: "chart-4", label: "growth" },
	{ icon: "calendar", shape: "hex", accent: "chart-5", label: "weeks" },
	{ icon: "fire", shape: "hex", accent: "chart-5", label: "streak" },
	{ icon: "clock-circle", shape: "hex", accent: "chart-5", label: "hours" },
	{ icon: "cardholder", shape: "plaque", accent: "chart-1", label: "flashcards" },
	{ icon: "bookmark", shape: "plaque", accent: "chart-1", label: "review" },
	{ icon: "hand-heart", shape: "ribbon", accent: "brand", label: "contributor" },
	{ icon: "star", shape: "diamond", accent: "muted", label: "founder" },
];

/** What the strip and the summary both read. */
export const OVERVIEW: AchievementsOverview = {
	categories: [
		{
			category: "Esplorazione",
			achievements: ACHIEVEMENTS.filter(a => a.category === "Esplorazione"),
		},
		{
			category: "Padronanza",
			achievements: ACHIEVEMENTS.filter(a => a.category === "Padronanza"),
		},
		{
			category: "Ritmo",
			achievements: ACHIEVEMENTS.filter(a => a.category === "Ritmo"),
		},
		{
			category: "Contributo",
			achievements: ACHIEVEMENTS.filter(a => a.category === "Contributo"),
		},
		{
			category: "Origine",
			achievements: ACHIEVEMENTS.filter(a => a.category === "Origine"),
		},
	],
	unlocked: ACHIEVEMENTS.filter(a => a.awardedAt !== null).length,
	total: 24,
	nextUp: ACHIEVEMENTS.filter(a => a.awardedAt === null && a.progress !== null).sort(
		(a, b) => b.progress!.ratio - a.progress!.ratio
	),
	pinned: ACHIEVEMENTS.filter(a => a.awardedAt !== null).slice(0, 3),
};
