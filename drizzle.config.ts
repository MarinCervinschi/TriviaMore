import { defineConfig } from "drizzle-kit";

// drizzle-kit runs DDL, so it connects as the admin role (ADMIN_DATABASE_URL,
// postgres), never as the least-privilege runtime role (trivia_app). Falls back
// to DATABASE_URL where the two are not split.
const migrationUrl = process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL;
// generate and check compare the schema with the snapshots in drizzle/ and never connect.
const offline = ["generate", "check"].includes(process.argv[2] ?? "");

if (!migrationUrl && !offline) {
	throw new Error(
		"ADMIN_DATABASE_URL (or DATABASE_URL) is not set: only drizzle-kit generate and check run without a database."
	);
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema",
	out: "./drizzle",
	dbCredentials: { url: migrationUrl ?? "" },
	schemaFilter: ["public", "catalog", "quiz", "internal", "crm", "ops"],
	casing: "snake_case",
	verbose: true,
	strict: true,
});
