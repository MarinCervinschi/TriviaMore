import { createMiddleware } from "@tanstack/react-start";

import { SERVER_FN_BASE } from "./observability";

const MiB = 1024 * 1024;

/** A 10 MB attachment plus the multipart framing. */
export const MAX_MULTIPART_BYTES = 11 * MiB;
/** The admin's bulk question import is the largest JSON a server function takes. */
export const MAX_SERVER_FN_JSON_BYTES = 2 * MiB;
/** Better Auth's routes and `/api/log`. */
export const MAX_OTHER_BYTES = 256 * 1024;

const NO_BODY = new Set(["GET", "HEAD", "OPTIONS"]);

function capFor(pathname: string, contentType: string): number {
	if (!pathname.startsWith(SERVER_FN_BASE)) return MAX_OTHER_BYTES;
	return contentType.includes("multipart/form-data")
		? MAX_MULTIPART_BYTES
		: MAX_SERVER_FN_JSON_BYTES;
}

/** The status a request body earns before anything reads it, or null when it may be read. */
export function bodyLimitStatus(request: Request, pathname: string): 411 | 413 | null {
	if (NO_BODY.has(request.method.toUpperCase())) return null;

	const headers = request.headers;
	if (headers.has("transfer-encoding")) return 411;

	const declared = headers.get("content-length");
	if (declared === null) return headers.has("content-type") ? 411 : null;

	const length = Number(declared);
	if (!/^\d+$/.test(declared.trim()) || !Number.isSafeInteger(length)) return 411;
	return length > capFor(pathname, headers.get("content-type") ?? "") ? 413 : null;
}

/** Refuses a body without a Content-Length, or larger than its route takes, before the handler reads it. */
export const bodyLimitMiddleware = createMiddleware({ type: "request" }).server(
	async ({ request, pathname, next }) => {
		const status = bodyLimitStatus(request, pathname);
		if (status !== null) return new Response(null, { status });
		return next();
	}
);
