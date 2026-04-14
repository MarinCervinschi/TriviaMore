/**
 * Post-process generated Supabase types.
 *
 * Supabase CLI types `tsvector` columns as `unknown`.
 * This script patches them to `string | null` which is
 * how PostgREST actually returns them.
 *
 * Usage: pnpm db:types
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const FILE = resolve("src/lib/supabase/database.types.ts")

let content = readFileSync(FILE, "utf-8")

// tsvector columns come back as text from PostgREST
content = content
  .replaceAll("fts: unknown", "fts: string | null")
  .replaceAll("fts?: unknown", "fts?: string | null")

writeFileSync(FILE, content)

console.log("Patched database.types.ts (fts: unknown → string | null)")
