import { z } from "zod"

// Validates frontmatter parsed from src/content/changelogs/*.md
export const changelogFrontmatterSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "version must be semver (e.g. 1.4.0)"),
  title: z.string().min(1),
  category: z.enum(["new", "improved", "fixed"]),
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "publishedAt must be YYYY-MM-DD"),
})

export const markChangelogsReadSchema = z.object({
  versions: z.array(z.string()).min(1),
})

export type MarkChangelogsReadInput = z.infer<typeof markChangelogsReadSchema>
