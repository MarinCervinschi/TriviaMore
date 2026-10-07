import { getConsoleSession } from "~/lib/auth/service";

import { SOURCE_HOSTS } from "./documents";

const MAX_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 30_000;
const FORWARDED_HEADERS = ["accept", "content-type"];

const refuse = (status: number, error: string) => Response.json({ error }, { status });

/** Forwards a request from the endpoint explorer to a data source, which the browser cannot reach across origins. */
export async function forwardToSource(request: Request): Promise<Response> {
	if (!(await getConsoleSession())) {
		return refuse(401, "Accesso riservato al proprietario della console.");
	}
	return relay(request);
}

/** The forwarding alone, for a caller already known to be the owner. */
export async function relay(request: Request): Promise<Response> {
	let target: URL;
	try {
		target = new URL(new URL(request.url).searchParams.get("scalar_url") ?? "");
	} catch {
		return refuse(400, "Manca l'indirizzo da interrogare.");
	}
	if (target.protocol !== "https:") {
		return refuse(403, "Solo indirizzi https.");
	}
	// Only the documented sources, so the console cannot be used to reach anything else.
	if (!SOURCE_HOSTS.has(target.host)) {
		return refuse(403, `${target.host} non è una delle fonti documentate.`);
	}

	const headers = new Headers();
	for (const name of FORWARDED_HEADERS) {
		const value = request.headers.get(name);
		if (value) headers.set(name, value);
	}

	let upstream: Response;
	const started = performance.now();
	try {
		upstream = await fetch(target, {
			method: request.method,
			headers,
			body:
				request.method === "GET" || request.method === "HEAD"
					? undefined
					: await request.arrayBuffer(),
			redirect: "manual",
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		const timedOut = error instanceof DOMException && error.name === "TimeoutError";
		return refuse(
			502,
			timedOut
				? "La fonte non ha risposto entro 30 secondi."
				: "La fonte non è raggiungibile."
		);
	}

	const body = await readCapped(upstream);
	if (!body) {
		return refuse(413, "La risposta supera 25 MB: provala da terminale.");
	}

	const responseHeaders = new Headers({
		"x-source-duration-ms": String(Math.round(performance.now() - started)),
	});
	for (const name of ["content-type", "location", "last-modified", "etag"]) {
		const value = upstream.headers.get(name);
		if (value) responseHeaders.set(name, value);
	}
	return new Response(body, { status: upstream.status, headers: responseHeaders });
}

async function readCapped(response: Response): Promise<ArrayBuffer | null> {
	if (!response.body) return new ArrayBuffer(0);
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_BYTES) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}
	const body = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body.buffer;
}
