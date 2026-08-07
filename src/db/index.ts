import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient } from "pg";

import { currentContext } from "@/lib/logging/context";
import { log } from "@/lib/logging/server";

import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// Every db/ function takes this as its first argument, so the same query runs
// standalone or inside a transaction.
export type DbOrTx = Db | Tx;

const POOL_MAX = 10;
const SLOW_QUERY_MS = 200;
const SATURATION_REPORT_MS = 10_000;

let _pool: Pool | null = null;
let _db: Db | null = null;

function createDb(pool: Pool) {
	return drizzle(pool, { schema, casing: "snake_case" });
}

// Never the parameter values: they carry answers, emails and everything else a
// user typed.
function statementText(statement: unknown): string {
	const text =
		typeof statement === "string"
			? statement
			: typeof statement === "object" && statement !== null && "text" in statement
				? String((statement as { text: unknown }).text)
				: "unknown";
	return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

async function track<T>(
	pool: Pool,
	statement: unknown,
	run: () => Promise<T>
): Promise<T> {
	const context = currentContext();
	const idleBefore = pool.idleCount;
	const startedAt = performance.now();
	try {
		return await run();
	} finally {
		const elapsed = performance.now() - startedAt;
		if (context) {
			context.dbQueries += 1;
			context.dbMs += elapsed;
		}
		const properties = {
			Elapsed: elapsed,
			Statement: statementText(statement),
			PoolIdle: idleBefore,
			PoolTotal: pool.totalCount,
		};
		if (elapsed >= SLOW_QUERY_MS) {
			log.warn(
				"Slow query took {Elapsed:0.0}ms ({PoolIdle} idle) — {Statement}",
				properties
			);
		} else {
			log.debug("Query took {Elapsed:0.0}ms — {Statement}", properties);
		}
	}
}

const INSTRUMENTED = Symbol("triviamore.instrumented");

function instrumentClient(pool: Pool, client: PoolClient): PoolClient {
	const marked = client as PoolClient & { [INSTRUMENTED]?: true };
	if (marked[INSTRUMENTED]) return client;
	marked[INSTRUMENTED] = true;

	const query = client.query.bind(client);
	client.query = ((...args: unknown[]) =>
		track(pool, args[0], () =>
			(query as (...a: unknown[]) => Promise<unknown>)(...args)
		)) as typeof client.query;

	return client;
}

function instrument(pool: Pool): Pool {
	let lastSaturationAt = 0;

	const reportSaturation = () => {
		if (pool.waitingCount === 0 || pool.totalCount < POOL_MAX) return;
		const now = performance.now();
		if (now - lastSaturationAt < SATURATION_REPORT_MS) return;
		lastSaturationAt = now;
		log.warn("Connection pool starved: {Waiting} waiting on {Total} connections", {
			Waiting: pool.waitingCount,
			Total: pool.totalCount,
			Idle: pool.idleCount,
		});
	};

	pool.on("connect", () => {
		log.info("Database connection opened: {Total} in the pool", {
			Total: pool.totalCount,
		});
	});

	const query = pool.query.bind(pool);
	// Only the promise form is instrumented; the callback form has no caller
	// here, Drizzle being the sole consumer of this pool.
	pool.query = ((...args: unknown[]) => {
		reportSaturation();
		return track(pool, args[0], () =>
			(query as (...a: unknown[]) => Promise<unknown>)(...args)
		);
	}) as typeof pool.query;

	const connect = pool.connect.bind(pool);
	pool.connect = ((...args: unknown[]) => {
		reportSaturation();
		const result = (connect as (...a: unknown[]) => unknown)(...args);
		if (!(result instanceof Promise)) return result;
		return result.then(client => instrumentClient(pool, client as PoolClient));
	}) as typeof pool.connect;

	return pool;
}

// Lazy because entry-server.tsx loads secrets on the first request, so
// DATABASE_URL is absent at module evaluation time.
export function getDb(): Db {
	if (_db) return _db;

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not set");

	_pool = new Pool({ connectionString, max: POOL_MAX });

	_pool.on("error", err => {
		log.error("Idle database client failed", {}, err);
	});

	_db = createDb(instrument(_pool));
	return _db;
}

export async function closeDb() {
	if (!_pool) return;
	await _pool.end();
	_pool = null;
	_db = null;
}
