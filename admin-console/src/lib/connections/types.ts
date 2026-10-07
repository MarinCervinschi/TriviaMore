export type ConnectionId = "staging" | "production";

export type ConnectionStatus = {
	id: ConnectionId;
	label: string;
	env: string;
	/** Host, port and database, never the credentials. */
	target: string | null;
	state: "unconfigured" | "ok" | "unreachable";
	latencyMs: number | null;
	database: string | null;
	version: string | null;
	readOnly: boolean | null;
	expectReadOnly: boolean;
	error: string | null;
};
