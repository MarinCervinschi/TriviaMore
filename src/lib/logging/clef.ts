// Compact Log Event Format — the wire format Seq ingests. Keys beginning with
// `@` are reserved by the format, so a property whose own name starts with one
// is escaped by doubling it. Seq renders `@mt` against the properties itself,
// which is why no rendered message is sent.

export type LogLevel = "Debug" | "Information" | "Warning" | "Error";

export type LogProperties = Record<string, unknown>;

export type SpanKind = "Client" | "Server" | "Internal" | "Producer" | "Consumer";

export type LogEvent = {
	timestamp: string;
	level: LogLevel;
	template: string;
	properties: LogProperties;
	error?: unknown;
	traceId?: string;
	spanId?: string;
	parentSpanId?: string;
	startTimestamp?: string;
	spanKind?: SpanKind;
};

const LEVEL_ORDER: Record<LogLevel, number> = {
	Debug: 10,
	Information: 20,
	Warning: 30,
	Error: 40,
};

export function meetsLevel(level: LogLevel, minimum: LogLevel): boolean {
	return LEVEL_ORDER[level] >= LEVEL_ORDER[minimum];
}

export function parseLevel(value: string | undefined): LogLevel {
	switch (value?.trim().toLowerCase()) {
		case "debug":
			return "Debug";
		case "warn":
		case "warning":
			return "Warning";
		case "error":
			return "Error";
		default:
			return "Information";
	}
}

const REDACTED = [
	"password",
	"passwd",
	"token",
	"secret",
	"apikey",
	"api_key",
	"authorization",
	"cookie",
	"credential",
	"email",
];

const MAX_DEPTH = 4;
const MAX_STRING = 2_000;
const MAX_ARRAY = 50;

function isRedacted(key: string): boolean {
	const lower = key.toLowerCase();
	return REDACTED.some(needle => lower.includes(needle));
}

function truncate(value: string, limit: number): string {
	return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

function sanitize(value: unknown, depth: number, seen: WeakSet<object>): unknown {
	if (value === null || value === undefined) return null;
	if (typeof value === "string") return truncate(value, MAX_STRING);
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
	if (typeof value === "bigint") return value.toString();
	if (typeof value === "symbol" || typeof value === "function") return undefined;
	if (value instanceof Date) return value.toISOString();
	if (value instanceof Error) return formatError(value);

	if (depth >= MAX_DEPTH) return "[depth limit]";

	if (Array.isArray(value)) {
		const items = value
			.slice(0, MAX_ARRAY)
			.map(item => sanitize(item, depth + 1, seen));
		return value.length > MAX_ARRAY
			? [...items, `…${value.length - MAX_ARRAY} more`]
			: items;
	}

	if (typeof value === "object") {
		if (seen.has(value)) return "[circular]";
		seen.add(value);
		const result: Record<string, unknown> = {};
		for (const [key, nested] of Object.entries(value)) {
			if (isRedacted(key)) {
				result[key] = "[redacted]";
				continue;
			}
			const clean = sanitize(nested, depth + 1, seen);
			if (clean !== undefined) result[key] = clean;
		}
		return result;
	}

	return String(value);
}

export function formatError(error: unknown): string {
	if (!(error instanceof Error)) return String(error);

	const parts = [error.stack ?? `${error.name}: ${error.message}`];
	let cause: unknown = error.cause;
	let depth = 0;
	while (cause instanceof Error && depth < 3) {
		parts.push(`Caused by: ${cause.stack ?? `${cause.name}: ${cause.message}`}`);
		cause = cause.cause;
		depth += 1;
	}
	return parts.join("\n");
}

export function errorProperties(error: unknown): LogProperties {
	if (typeof error !== "object" || error === null) return {};
	const { code, constraint } = error as { code?: unknown; constraint?: unknown };
	return {
		...(typeof code === "string" ? { ErrorCode: code } : {}),
		...(typeof constraint === "string" ? { ErrorConstraint: constraint } : {}),
	};
}

export function toClef(event: LogEvent): string {
	const payload: Record<string, unknown> = {
		"@t": event.timestamp,
		"@l": event.level,
		"@mt": event.template,
	};
	if (event.traceId) payload["@tr"] = event.traceId;
	if (event.spanId) payload["@sp"] = event.spanId;
	if (event.parentSpanId) payload["@ps"] = event.parentSpanId;
	if (event.startTimestamp) payload["@st"] = event.startTimestamp;
	if (event.spanKind) payload["@sk"] = event.spanKind;
	if (event.error !== undefined) payload["@x"] = formatError(event.error);

	const seen = new WeakSet<object>();
	for (const [key, value] of Object.entries(event.properties)) {
		const clean = isRedacted(key) ? "[redacted]" : sanitize(value, 0, seen);
		if (clean === undefined) continue;
		payload[key.startsWith("@") ? `@${key}` : key] = clean;
	}

	return JSON.stringify(payload);
}

// Seq renders the template server-side; this is only for the console fallback.
export function render(template: string, properties: LogProperties): string {
	return template.replace(/\{(\w+)(?::[^}]*)?\}/g, (match, name: string) =>
		name in properties ? String(properties[name]) : match
	);
}
