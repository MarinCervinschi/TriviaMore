import { drizzle } from "drizzle-orm/node-postgres";
import { performance } from "node:perf_hooks";
import { Pool, type PoolClient } from "pg";

import { currentContext, newSpanId } from "@/lib/logging/context";
import { log, logSpan } from "@/lib/logging/server";

import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export type DbOrTx = Db | Tx;

const POOL_MAX = 10;
const SLOW_QUERY_MS = 200;
const BUSY_LOOP_SHARE = 0.5;
const SATURATION_REPORT_MS = 10_000;

let _pool: Pool | null = null;
let _db: Db | null = null;

function createDb(pool: Pool) {
	return drizzle(pool, { schema, casing: "snake_case" });
}

// Never the parameter values, which carry answers, emails and anything else a user typed.
function statementText(statement: unknown): string {
	const text =
		typeof statement === "string"
			? statement
			: typeof statement === "object" && statement !== null && "text" in statement
				? String((statement as { text: unknown }).text)
				: "unknown";
	return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

const QUERY_TOOK = "Query took {Elapsed:0.0}ms — {Statement}";

// Elapsed is measured from Node, so a query that finished while the event loop was busy rendering reads as slow.
function templateFor(elapsed: number, waited: number, loopBusy: number): string {
	if (elapsed >= SLOW_QUERY_MS) {
		return loopBusy >= BUSY_LOOP_SHARE
			? "Query took {Elapsed:0.0}ms on a busy event loop ({LoopBusy}% busy) — {Statement}"
			: "Slow query took {Elapsed:0.0}ms ({PoolIdle} idle) — {Statement}";
	}
	if (waited >= SLOW_QUERY_MS)
		return "Query waited {Waited:0.0}ms for a connection ({PoolIdle} idle) — {Statement}";
	return QUERY_TOOK;
}

type Checkout = { waited: number; idleBefore: number };

async function track<T>(
	pool: Pool,
	statement: unknown,
	run: () => Promise<T>,
	checkout: Checkout = { waited: 0, idleBefore: pool.idleCount }
): Promise<T> {
	const context = currentContext();
	const startedAt = performance.now();
	const startedEpoch = Date.now();
	const loopBefore = performance.eventLoopUtilization();
	try {
		return await run();
	} finally {
		const elapsed = performance.now() - startedAt;
		const loopBusy = performance.eventLoopUtilization(loopBefore).utilization;
		if (context) {
			context.dbQueries += 1;
			context.dbMs += checkout.waited + elapsed;
			context.dbWaitMs += checkout.waited;
		}
		const properties = {
			Elapsed: elapsed,
			Waited: checkout.waited,
			LoopBusy: Math.round(loopBusy * 100),
			Statement: statementText(statement),
			PoolIdle: checkout.idleBefore,
			PoolTotal: pool.totalCount,
		};
		const template = templateFor(elapsed, checkout.waited, loopBusy);
		const warn = template !== QUERY_TOOK;

		if (context) {
			logSpan({
				level: warn ? "Warning" : "Debug",
				template,
				properties,
				spanId: newSpanId(),
				parentSpanId: context.spanId,
				startedAt: new Date(startedEpoch).toISOString(),
				kind: "Client",
			});
		} else if (warn) {
			log.warn(template, properties);
		} else {
			log.debug(template, properties);
		}
	}
}

const RAW_QUERY = Symbol("triviamore.rawQuery");

type MarkedClient = PoolClient & {
	[RAW_QUERY]?: (...args: unknown[]) => Promise<unknown>;
};

function rawQuery(client: PoolClient) {
	const marked = client as MarkedClient;
	return (
		marked[RAW_QUERY] ??
		(client.query.bind(client) as (...a: unknown[]) => Promise<unknown>)
	);
}

function instrumentClient(pool: Pool, client: PoolClient): PoolClient {
	const marked = client as MarkedClient;
	if (marked[RAW_QUERY]) return client;

	const query = client.query.bind(client);
	marked[RAW_QUERY] = query as (...a: unknown[]) => Promise<unknown>;
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

	const connect = pool.connect.bind(pool) as () => Promise<PoolClient>;

	// Checks out by hand, as pg's own pool.query does, so the wait for a connection is timed apart from the query.
	const checkedOutQuery = async (args: unknown[]) => {
		const checkout = { waited: 0, idleBefore: pool.idleCount };
		const waitStart = performance.now();
		const client = await connect();
		checkout.waited = performance.now() - waitStart;
		let failure: Error | undefined;
		try {
			return await track(pool, args[0], () => rawQuery(client)(...args), checkout);
		} catch (error) {
			failure = error instanceof Error ? error : new Error(String(error));
			throw error;
		} finally {
			client.release(failure);
		}
	};

	const query = pool.query.bind(pool);
	pool.query = ((...args: unknown[]) => {
		reportSaturation();
		// Drizzle never uses the callback form, so it keeps pg's own path, untimed.
		if (typeof args[args.length - 1] === "function")
			return (query as (...a: unknown[]) => unknown)(...args);
		return checkedOutQuery(args);
	}) as typeof pool.query;

	pool.connect = ((...args: unknown[]) => {
		reportSaturation();
		const result = (connect as (...a: unknown[]) => unknown)(...args);
		if (!(result instanceof Promise)) return result;
		return result.then(client => instrumentClient(pool, client as PoolClient));
	}) as typeof pool.connect;

	return pool;
}

export function getDb(): Db {
	if (_db) return _db;

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not set");

	// pg closes a connection idle for 10 s by default, so a burst after a quiet spell paid to reopen the whole pool.
	_pool = new Pool({ connectionString, max: POOL_MAX, min: POOL_MAX });

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
