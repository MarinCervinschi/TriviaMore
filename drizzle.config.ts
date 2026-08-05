import { defineConfig } from "drizzle-kit"

// drizzle-kit runs DDL, so it connects as the admin role (SUPABASE_DB_URL,
// postgres), never as the least-privilege runtime role (trivia_app). Falls back
// to DATABASE_URL where the two are not split.
const migrationUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL

if (!migrationUrl) {
  throw new Error(
    "SUPABASE_DB_URL (or DATABASE_URL) is not set. Run drizzle-kit through the pnpm db:* scripts so Infisical injects it.",
  )
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./drizzle",
  dbCredentials: { url: migrationUrl },
  schemaFilter: ["public", "catalog", "quiz", "internal"],
  // Without this drizzle-kit emits DROP ROLE for anon/authenticated/service_role.
  entities: { roles: { provider: "supabase" } },
  casing: "snake_case",
  verbose: true,
  strict: true,
})
