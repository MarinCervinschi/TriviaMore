import { AsyncLocalStorage } from "node:async_hooks";

export type LogSource = "ssr" | "fn" | "job" | "browser";

export type RequestContext = {
	traceId: string;
	spanId: string;
	source: LogSource;
	path: string;
	fn?: string;
	userId?: string;
	dbQueries: number;
	dbMs: number;
	authChecks: number;
	authMs: number;
	outcome?: string;
	errorCode?: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function newTraceId(): string {
	return crypto.randomUUID().replaceAll("-", "");
}

export function newSpanId(): string {
	return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}

export function createContext(
	init: Pick<RequestContext, "source" | "path"> & Partial<RequestContext>
): RequestContext {
	return {
		traceId: newTraceId(),
		spanId: newSpanId(),
		dbQueries: 0,
		dbMs: 0,
		authChecks: 0,
		authMs: 0,
		...init,
	};
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
	return storage.run(context, fn);
}

export function currentContext(): RequestContext | undefined {
	return storage.getStore();
}

export function attachUser(userId: string): void {
	const context = storage.getStore();
	if (context) context.userId = userId;
}

export function recordAuthCheck(elapsedMs: number): void {
	const context = storage.getStore();
	if (!context) return;
	context.authChecks += 1;
	context.authMs += elapsedMs;
}
