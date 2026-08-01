import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run drizzle-kit through the pnpm db:* scripts so Infisical injects it.",
  )
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  schemaFilter: ["public", "catalog", "quiz", "internal"],
  // Without this drizzle-kit emits DROP ROLE for anon/authenticated/service_role.
  entities: { roles: { provider: "supabase" } },
  casing: "snake_case",
  verbose: true,
  strict: true,
})
