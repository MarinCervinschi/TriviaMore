import { describe, expect, it, vi } from "vitest";

import { accessMiddleware } from "./middleware";

const CONSOLE = "admin.trivia-more.it";
const SERVER_FN_PATH = "/_serverFn/setSchedulePausedFn";

function post(headers: Record<string, string>) {
	return new Request(`https://${CONSOLE}${SERVER_FN_PATH}`, {
		method: "POST",
		headers: { host: CONSOLE, "content-type": "text/plain", ...headers },
		body: JSON.stringify({ data: { key: "all", paused: true } }),
	});
}

async function run(request: Request) {
	const next = vi.fn(async () => new Response("ok"));
	const server = accessMiddleware.options.server as unknown as (args: {
		request: Request;
		pathname: string;
		next: () => Promise<Response>;
	}) => Promise<Response>;
	const response = await server({
		request,
		pathname: new URL(request.url).pathname,
		next,
	});
	return { response, next };
}

describe("accessMiddleware", () => {
	it("refuses a text/plain POST to a mutation from another site", async () => {
		const { response, next } = await run(
			post({ origin: "https://example.com", "sec-fetch-site": "cross-site" })
		);
		expect(response.status).toBe(403);
		expect(next).not.toHaveBeenCalled();
	});

	it("refuses a POST with a cross-site Origin even without fetch metadata", async () => {
		const { response } = await run(post({ origin: "https://example.com" }));
		expect(response.status).toBe(403);
	});

	it("refuses a POST from a sibling subdomain", async () => {
		const { response } = await run(
			post({ origin: `https://${CONSOLE}`, "sec-fetch-site": "same-site" })
		);
		expect(response.status).toBe(403);
	});

	it("refuses a POST without an Origin", async () => {
		const { response } = await run(post({}));
		expect(response.status).toBe(403);
	});

	it("lets a POST from the console through", async () => {
		const { response, next } = await run(
			post({ origin: `https://${CONSOLE}`, "sec-fetch-site": "same-origin" })
		);
		expect(next).toHaveBeenCalledOnce();
		expect(response.status).toBe(200);
	});

	it("lets a GET read through whatever its origin", async () => {
		const { next } = await run(
			new Request(`https://${CONSOLE}/_serverFn/listJobsFn`, {
				headers: { host: CONSOLE, "sec-fetch-site": "cross-site" },
			})
		);
		expect(next).toHaveBeenCalledOnce();
	});
});
