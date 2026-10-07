import { CONNECTION_ENV, poolFor } from "~/lib/db/client";

import type { ConnectionId, ConnectionStatus } from "./types";

const CONNECTIONS: { id: ConnectionId; label: string; expectReadOnly: boolean }[] = [
	{ id: "staging", label: "Staging", expectReadOnly: false },
	{ id: "production", label: "Produzione", expectReadOnly: true },
];

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
			const env = CONNECTION_ENV[connection.id];
			const url = process.env[env];
			const base = {
				...connection,
				env,
				target: url ? targetOf(url) : null,
				latencyMs: null,
				database: null,
				version: null,
				readOnly: null,
				error: null,
			};
			const pool = poolFor(connection.id);
			if (!pool) return { ...base, state: "unconfigured" as const };

			const started = performance.now();
			try {
				const { rows } = await pool.query<{
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
