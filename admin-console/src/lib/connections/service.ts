import { Pool } from "pg";

import type { ConnectionId, ConnectionStatus } from "./types";

const CONNECTIONS: {
	id: ConnectionId;
	label: string;
	env: string;
	expectReadOnly: boolean;
}[] = [
	{
		id: "staging",
		label: "Staging",
		env: "STAGING_DATABASE_URL",
		expectReadOnly: false,
	},
	{
		id: "production",
		label: "Produzione",
		env: "PRODUCTION_READONLY_DATABASE_URL",
		expectReadOnly: true,
	},
];

const pools = new Map<ConnectionId, Pool>();

function poolFor(id: ConnectionId, url: string): Pool {
	const existing = pools.get(id);
	if (existing) return existing;
	const pool = new Pool({
		connectionString: url,
		max: 2,
		connectionTimeoutMillis: 5000,
	});
	pool.on("error", () => pools.delete(id));
	pools.set(id, pool);
	return pool;
}

function targetOf(url: string): string | null {
	try {
		const parsed = new URL(url);
		return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
	} catch {
		return null;
	}
}

/** Each database the console uses, probed with one read-only query. */
export async function probeConnections(): Promise<ConnectionStatus[]> {
	return Promise.all(
		CONNECTIONS.map(async connection => {
			const url = process.env[connection.env];
			const base = {
				...connection,
				target: url ? targetOf(url) : null,
				latencyMs: null,
				database: null,
				version: null,
				readOnly: null,
				error: null,
			};
			if (!url) return { ...base, state: "unconfigured" as const };

			const started = performance.now();
			try {
				const { rows } = await poolFor(connection.id, url).query<{
					database: string;
					version: string;
					read_only: string;
				}>(
					"select current_database() as database, current_setting('server_version') as version, current_setting('transaction_read_only') as read_only"
				);
				const row = rows[0]!;
				return {
					...base,
					state: "ok" as const,
					latencyMs: Math.round(performance.now() - started),
					database: row.database,
					version: row.version,
					readOnly: row.read_only === "on",
				};
			} catch (error) {
				return {
					...base,
					state: "unreachable" as const,
					error: error instanceof Error ? error.message : "Connessione fallita",
				};
			}
		})
	);
}
