import { createMiddleware } from "@tanstack/react-start";

import type { LogLevel } from "@/lib/logging/clef";
import { createContext, currentContext, runWithContext } from "@/lib/logging/context";
import { log, logSpan } from "@/lib/logging/server";

const ASSET_PATTERN = /\.(js|mjs|css|map|ico|png|jpe?g|gif|svg|webp|avif|woff2?)$/i;

const SERVER_FN_BASE = process.env.TSS_SERVER_FN_BASE ?? "/_serverFn/";

const DISCONNECT_CODES = new Set([
	"ABORT_ERR",
	"AbortError",
	"ECONNABORTED",
	"ECONNRESET",
	"EPIPE",
	"ERR_STREAM_PREMATURE_CLOSE",
]);

function isAsset(pathname: string): boolean {
	return (
		pathname.startsWith("/_build/") ||
		pathname.startsWith("/assets/") ||
		pathname.startsWith("/@") ||
		ASSET_PATTERN.test(pathname)
	);
}

function isDisconnect(error: unknown, request: Request): boolean {
	if (request.signal.aborted) return true;
	if (typeof error !== "object" || error === null) return false;
	const { code, name } = error as { code?: unknown; name?: unknown };
	return (
		(typeof code === "string" && DISCONNECT_CODES.has(code)) ||
		(typeof name === "string" && DISCONNECT_CODES.has(name))
	);
}

function levelFor(status: number | undefined, disconnected: boolean): LogLevel {
	if (status === undefined) return disconnected ? "Warning" : "Error";
	if (status >= 500) return "Error";
	if (status >= 400) return "Warning";
	return "Information";
}

function outcomeFor(status: number | undefined, disconnected: boolean): string {
	if (status === undefined) return disconnected ? "aborted" : "failed";
	return status < 400 ? "ok" : "error";
}

export const observabilityMiddleware = createMiddleware({ type: "request" }).server(
	async ({ pathname, request, next }) => {
		if (isAsset(pathname)) return next();

		const context = createContext({
			source: pathname.startsWith(SERVER_FN_BASE) ? "fn" : "ssr",
			path: pathname,
		});

		return runWithContext(context, async () => {
			const startedAt = performance.now();
			const startedIso = new Date().toISOString();
			let status: number | undefined;
			let failure: unknown;

			try {
				const result = await next();
				status = result.response.status;
				// Lets a browser-side report name the exact request it came from.
				// Some responses carry immutable headers, and a log line is never
				// worth failing a request over.
				try {
					result.response.headers.set("x-request-id", context.traceId);
				} catch {
					/* empty */
				}
				return result;
			} catch (error) {
				failure = error;
				throw error;
			} finally {
				const elapsed = performance.now() - startedAt;
				// Nothing was served, so there is no status to report: defaulting it
				// to 500 made every scanner that hangs up look like a server error.
				const disconnected = status === undefined && isDisconnect(failure, request);
				const properties = {
					Method: request.method,
					Path: pathname,
					...(status === undefined ? {} : { Status: status }),
					Elapsed: elapsed,
					Outcome: context.outcome ?? outcomeFor(status, disconnected),
					...(context.fn ? { Fn: context.fn } : {}),
					...(context.errorCode ? { ErrorCode: context.errorCode } : {}),
					DbQueries: context.dbQueries,
					DbMs: context.dbMs,
					AuthChecks: context.authChecks,
					AuthMs: context.authMs,
					AppMs: Math.max(0, elapsed - context.dbMs - context.authMs),
				};

				logSpan({
					level: levelFor(status, disconnected),
					template: context.fn
						? "{Fn} → {Outcome} in {Elapsed:0.0}ms"
						: status === undefined
							? "{Method} {Path} → {Outcome} in {Elapsed:0.0}ms"
							: "{Method} {Path} → {Status} in {Elapsed:0.0}ms",
					properties,
					spanId: context.spanId,
					startedAt: startedIso,
					kind: "Server",
					error: failure,
				});
			}
		});
	}
);

export const serverFnObservabilityMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next, serverFnMeta }) => {
	const context = currentContext();

	if (context?.source === "fn") {
		if (!context.fn && serverFnMeta.name) context.fn = serverFnMeta.name;
		return next();
	}

	const startedAt = performance.now();
	try {
		return await next();
	} finally {
		log.debug("{Fn} ran in {Elapsed:0.0}ms during the render", {
			Fn: serverFnMeta.name || serverFnMeta.id,
			Elapsed: performance.now() - startedAt,
		});
	}
});
