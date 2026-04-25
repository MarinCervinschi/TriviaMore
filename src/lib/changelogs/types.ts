export type ChangelogCategory = "new" | "improved" | "fixed"

export interface ChangelogEntry {
  version: string
  title: string
  category: ChangelogCategory
  publishedAt: string
  body: string
}

export const CATEGORY_CONFIG = {
  new: {
    label: "Novità",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  improved: {
    label: "Miglioramento",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  fixed: {
    label: "Correzione",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
} as const
