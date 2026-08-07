import {
	type LogLevel,
	type LogProperties,
	errorProperties,
	meetsLevel,
	parseLevel,
} from "./clef";
import { currentContext, newTraceId, recordAuthCheck } from "./context";
import { ship } from "./shipper";

// The server-side logging API. Never import this from a component: it reaches
// `node:async_hooks` through the request context. Browser logging goes through
// its own entry point.
//
// Property names are PascalCase, matching the `{Placeholder}` in the template —
// Seq indexes them, so `Elapsed > 500` only works if the value is passed as a
// property and not interpolated into the message.

let minimum: LogLevel | undefined;
let version: string | null | undefined;

function minimumLevel(): LogLevel {
	minimum ??= parseLevel(process.env.LOG_LEVEL);
	return minimum;
}

// Coolify injects SOURCE_COMMIT at runtime. Reading it here rather than baking
// it in at build time is deliberate: passing it as a build arg would change the
// Dockerfile on every commit and invalidate the layer cache, which is why
// Coolify keeps it out of builds by default. APP_VERSION is the manual override
// for anything not deployed by Coolify.
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
