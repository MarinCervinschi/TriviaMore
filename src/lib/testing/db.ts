import { TransactionRollbackError } from "drizzle-orm/errors";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

// The integration tier runs only against a local database. A rolled-back
// transaction still opens a real connection, so a stray TEST_DATABASE_URL must
// never be allowed to reach the shared production database: this guard refuses
// any non-local host outright.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const DEFAULT_TEST_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

function resolveTestUrl(): string {
	const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_URL;
	const host = new URL(url).hostname;
	if (!LOCAL_HOSTS.has(host)) {
		throw new Error(
			`Refusing to run integration tests against non-local host "${host}". ` +
				"Point TEST_DATABASE_URL at a local database."
		);
	}
	return url;
}

let pool: Pool | null = null;
let db: ReturnType<typeof createTestDb> | null = null;

function createTestDb(p: Pool) {
	return drizzle(p, { schema, casing: "snake_case" });
}

export function getTestDb() {
	if (db) return db;
	pool = new Pool({ connectionString: resolveTestUrl(), max: 5 });
	db = createTestDb(pool);
	return db;
}

export async function closeTestDb() {
	if (!pool) return;
	await pool.end();
	pool = null;
	db = null;
}

type TestDb = ReturnType<typeof getTestDb>;
export type TestTx = Parameters<Parameters<TestDb["transaction"]>[0]>[0];

// Runs the body inside a transaction that is always rolled back. Tests never
// persist anything and never need to clean up after one another — the same
// guarantee `pnpm smoke:writes` relies on.
export async function withRollback<T>(body: (tx: TestTx) => Promise<T>): Promise<T> {
	const database = getTestDb();
	let result: T;
	try {
		await database.transaction(async tx => {
			result = await body(tx);
			tx.rollback();
		});
	} catch (error) {
		if (!(error instanceof TransactionRollbackError)) throw error;
	}
	return result!;
}
