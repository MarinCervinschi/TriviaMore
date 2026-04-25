import { changelogFrontmatterSchema } from "./schemas"

import type { ChangelogEntry } from "./types"

// Vite-resolves all markdown changelogs at build time as raw strings.
const rawFiles = import.meta.glob("../../content/changelogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

// Minimal frontmatter parser: expects a leading `---\n...\n---\n` block
// with `key: value` lines. Values are returned as raw strings; zod
// validates the resulting object.
function parseFrontmatter(raw: string, source: string): {
  data: Record<string, string>
  body: string
} {
  if (!raw.startsWith("---")) {
    throw new Error(`Changelog ${source} is missing frontmatter`)
  }

  const closeIndex = raw.indexOf("\n---", 3)
  if (closeIndex === -1) {
    throw new Error(`Changelog ${source} has unterminated frontmatter`)
  }

  const head = raw.slice(3, closeIndex).trim()
  // Skip the closing `---` and any trailing newline so the body starts clean
  const bodyStart = raw.indexOf("\n", closeIndex + 4)
  const body = bodyStart === -1 ? "" : raw.slice(bodyStart + 1).trim()

  const data: Record<string, string> = {}
  for (const line of head.split("\n")) {
    if (!line.trim()) continue
    const colon = line.indexOf(":")
    if (colon === -1) {
      throw new Error(`Changelog ${source}: malformed frontmatter line: "${line}"`)
    }
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "")
    data[key] = value
  }

  return { data, body }
}

function buildEntries(): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []

  for (const [path, raw] of Object.entries(rawFiles)) {
    const { data, body } = parseFrontmatter(raw, path)
    const meta = changelogFrontmatterSchema.parse(data)
    entries.push({ ...meta, body })
  }

  // Most recent first
  entries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  return entries
}

export const CHANGELOGS: ChangelogEntry[] = buildEntries()

export const CHANGELOG_VERSIONS: string[] = CHANGELOGS.map((c) => c.version)
