import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

/** The console's one database: the local one in development, production once deployed. */
export const DATABASE_ENV = "DATABASE_URL";

let pool: Pool | null = null;

/** A small pool, made on first use; null when the variable is not set. */
export function consolePool(): Pool | null {
	if (pool) return pool;
	const url = process.env[DATABASE_ENV];
	if (!url) return null;
	pool = new Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 5000 });
	pool.on("error", () => {
		pool = null;
		db = null;
	});
	return pool;
}

function createDb(from: Pool) {
	return drizzle(from, { schema, casing: "snake_case" });
}

export type ConsoleDb = ReturnType<typeof createDb>;

let db: ConsoleDb | null = null;

/** The app's schema over the console's database. */
export function consoleDb(): ConsoleDb {
	if (db) return db;
	const from = consolePool();
	if (!from) throw new Error(`${DATABASE_ENV} non è configurata.`);
	db = createDb(from);
	return db;
}
