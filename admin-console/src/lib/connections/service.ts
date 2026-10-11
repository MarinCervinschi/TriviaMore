import { DATABASE_ENV, consolePool } from "~/lib/db/client";
import { ENVIRONMENT_LABEL } from "~/lib/environment";

import type { ConnectionStatus } from "./types";

function targetOf(url: string): string | null {
	try {
		const parsed = new URL(url);
		return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
	} catch {
		return null;
	}
}

/** The console's database, probed with one read-only query. */
export async function probeConnection(): Promise<ConnectionStatus> {
	const url = process.env[DATABASE_ENV];
	const base = {
		label: ENVIRONMENT_LABEL,
		env: DATABASE_ENV,
		target: url ? targetOf(url) : null,
		latencyMs: null,
		database: null,
		version: null,
		readOnly: null,
		error: null,
	};
	const pool = consolePool();
	if (!pool) return { ...base, state: "unconfigured" };

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
			state: "ok",
			latencyMs: Math.round(performance.now() - started),
			database: row.database,
			version: row.version,
			readOnly: row.read_only === "on",
		};
	} catch (error) {
		return {
			...base,
			state: "unreachable",
			error: error instanceof Error ? error.message : "Connessione fallita",
		};
	}
}
