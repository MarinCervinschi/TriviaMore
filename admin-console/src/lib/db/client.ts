import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

import type { ConnectionId } from "~/lib/connections/types";

export const CONNECTION_ENV: Record<ConnectionId, string> = {
	staging: "STAGING_DATABASE_URL",
	production: "PRODUCTION_READONLY_DATABASE_URL",
};

const pools = new Map<ConnectionId, Pool>();

/** One small pool per database, made on first use; null when its variable is not set. */
export function poolFor(id: ConnectionId): Pool | null {
	const existing = pools.get(id);
	if (existing) return existing;
	const url = process.env[CONNECTION_ENV[id]];
	if (!url) return null;
	const pool = new Pool({
		connectionString: url,
		max: 3,
		connectionTimeoutMillis: 5000,
	});
	pool.on("error", () => pools.delete(id));
	pools.set(id, pool);
	return pool;
}

function createDb(pool: Pool) {
	return drizzle(pool, { schema, casing: "snake_case" });
}

export type ConsoleDb = ReturnType<typeof createDb>;

const dbs = new Map<ConnectionId, ConsoleDb>();

/** The app's schema over one of the console's databases. */
export function dbFor(id: ConnectionId): ConsoleDb {
	const existing = dbs.get(id);
	if (existing) return existing;
	const pool = poolFor(id);
	if (!pool) throw new Error(`${CONNECTION_ENV[id]} non è configurata.`);
	const db = createDb(pool);
	dbs.set(id, db);
	return db;
}
