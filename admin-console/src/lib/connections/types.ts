export type ConnectionStatus = {
	label: string;
	env: string;
	/** Host, port and database, never the credentials. */
	target: string | null;
	state: "unconfigured" | "ok" | "unreachable";
	latencyMs: number | null;
	database: string | null;
	version: string | null;
	readOnly: boolean | null;
	error: string | null;
};
