export type ChangelogCategory = "new" | "improved" | "fixed";

export interface ChangelogEntry {
	version: string;
	title: string;
	category: ChangelogCategory;
	publishedAt: string;
	body: string;
}

export const CATEGORY_CONFIG = {
	new: {
		label: "Novità",
		color: "text-chart-3-ink",
		bg: "bg-chart-3/10",
		border: "border-chart-3/30",
	},
	improved: {
		label: "Miglioramento",
		color: "text-chart-2-ink",
		bg: "bg-chart-2/10",
		border: "border-chart-2/30",
	},
	fixed: {
		label: "Correzione",
		color: "text-chart-5-ink",
		bg: "bg-chart-5/10",
		border: "border-chart-5/30",
	},
} as const;
