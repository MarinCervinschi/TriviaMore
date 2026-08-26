import {
	type LogLevel,
	type LogProperties,
	type SpanKind,
	errorProperties,
	meetsLevel,
	parseLevel,
} from "./clef";
import { currentContext, newTraceId, recordAuthCheck } from "./context";
import { ship } from "./shipper";

let minimum: LogLevel | undefined;
let version: string | null | undefined;

function minimumLevel(): LogLevel {
	minimum ??= parseLevel(process.env.LOG_LEVEL);
	return minimum;
}

function appVersion(): string | null {
	if (version === undefined) {
		version =
			process.env.APP_VERSION?.trim() || process.env.SOURCE_COMMIT?.trim() || null;
	}
	return version;
}

function emit(
	level: LogLevel,
	template: string,
	properties: LogProperties = {},
	error?: unknown
): void {
	if (!meetsLevel(level, minimumLevel())) return;

	const context = currentContext();
	const release = appVersion();

	ship({
		timestamp: new Date().toISOString(),
		level,
		template,
		traceId: context?.traceId,
		spanId: context?.spanId,
		error,
		properties: {
			Source: context?.source ?? "job",
			...(context?.userId ? { UserId: context.userId } : {}),
			...(release ? { Version: release } : {}),
			...properties,
			...(error === undefined ? {} : errorProperties(error)),
		},
	});
}

export const log = {
	debug: (template: string, properties?: LogProperties) =>
		emit("Debug", template, properties),
	info: (template: string, properties?: LogProperties) =>
		emit("Information", template, properties),
	warn: (template: string, properties?: LogProperties) =>
		emit("Warning", template, properties),
	error: (template: string, properties?: LogProperties, error?: unknown) =>
		emit("Error", template, properties, error),
};

/**
 * A completed unit of work, as a span rather than a log line: Seq nests it under
 * the request it belongs to and shows where the time went. `startedAt` is the
 * ISO instant the work began — the event's own timestamp closes it.
 */
export function logSpan(params: {
	level: LogLevel;
	template: string;
	properties?: LogProperties;
	spanId: string;
	parentSpanId?: string;
	startedAt: string;
	kind: SpanKind;
	error?: unknown;
}): void {
	if (!meetsLevel(params.level, minimumLevel())) return;

	const context = currentContext();
	const release = appVersion();

	ship({
		timestamp: new Date().toISOString(),
		level: params.level,
		template: params.template,
		traceId: context?.traceId,
		spanId: params.spanId,
		parentSpanId: params.parentSpanId,
		startTimestamp: params.startedAt,
		spanKind: params.kind,
		error: params.error,
		properties: {
			Source: context?.source ?? "job",
			...(context?.userId ? { UserId: context.userId } : {}),
			...(release ? { Version: release } : {}),
			...params.properties,
			...(params.error === undefined ? {} : errorProperties(params.error)),
		},
	});
}

export function debugEnabled(): boolean {
	return meetsLevel("Debug", minimumLevel());
}

// `Source` is stamped here, not by the client, so it cannot be forged.
export function shipBrowserEvent(event: {
	level: LogLevel;
	template: string;
	properties?: LogProperties;
	error?: string;
	traceId?: string;
}): void {
	if (!meetsLevel(event.level, minimumLevel())) return;

	const release = appVersion();

	ship({
		timestamp: new Date().toISOString(),
		level: event.level,
		template: event.template,
		traceId: event.traceId ?? newTraceId(),
		error: event.error,
		properties: {
			Source: "browser",
			...(release ? { Version: release } : {}),
			...event.properties,
		},
	});
}

export async function timeAuthCheck<T>(run: () => Promise<T>): Promise<T> {
	const startedAt = performance.now();
	try {
		return await run();
	} finally {
		const elapsed = performance.now() - startedAt;
		recordAuthCheck(elapsed);
		log.debug("Auth check took {Elapsed:0.0}ms", { Elapsed: elapsed });
	}
}
