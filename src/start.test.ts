import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { startInstance } from "./start";

vi.mock("@/lib/logging/server", () => ({
	log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
	logSpan: vi.fn(),
}));

const EMAIL = "dummy-student@example.test";

const SESSION_COOKIES =
	"better-auth.session_token=DummyToken.DummySignature; better-auth.session_data=DummyCookieCache";

/** Runs the request middleware registered in start.ts around a handler that stands in for the router. */
async function serve(
	path: string,
	handler: () => Response,
	cookie: string | null = SESSION_COOKIES,
	init: RequestInit = {}
): Promise<Response> {
	const request = new Request(`http://localhost${path}`, {
		headers: cookie ? { accept: "text/html", cookie } : { accept: "text/html" },
		...init,
	});
	const { requestMiddleware = [] } = await startInstance.getOptions();
	const chain = requestMiddleware.map(middleware => middleware.options.server!);

	const run = async (index: number): Promise<{ response: Response }> => {
		const server = chain[index];
		if (!server) return { response: handler() };
		const result = (await server({
			request,
			pathname: new URL(request.url).pathname,
			context: {},
			next: () => run(index + 1),
		} as never)) as Response | { response: Response };
		// Start turns a Response a middleware returns into its result, as here.
		return result instanceof Response ? { response: result } : result;
	};

	return (await run(0)).response;
}

function renderedPage(status: number, user: { email: string } | null): Response {
	const state = JSON.stringify({
		queries: [{ queryKey: ["auth", "session"], data: user }],
	});
	return new Response(
		`<!DOCTYPE html><html><body><script>$_TSR=${state}</script></body></html>`,
		{
			status,
			headers: { "Content-Type": "text/html; charset=utf-8" },
		}
	);
}

describe("response caching", () => {
	it("keeps a signed-in 404 under a file extension out of every cache", async () => {
		const response = await serve(`/browse/${randomUUID()}.css`, () =>
			renderedPage(404, { email: EMAIL })
		);

		expect(response.status).toBe(404);
		expect(await response.clone().text()).toContain(EMAIL);
		expect(response.headers.getSetCookie()).toEqual([]);
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("keeps a signed-in page out of every cache", async () => {
		const response = await serve("/user/progress", () =>
			renderedPage(200, { email: EMAIL })
		);

		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("sends the same header on a page rendered without a session", async () => {
		const response = await serve("/browse", () => renderedPage(200, null), null);

		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("keeps server-function results out of every cache", async () => {
		const response = await serve(
			"/_serverFn/dummy-fn-id",
			() =>
				new Response(JSON.stringify({ email: EMAIL }), {
					headers: { "Content-Type": "application/json" },
				})
		);

		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("leaves a Cache-Control the route chose alone", async () => {
		const response = await serve(
			"/sitemap.xml",
			() =>
				new Response("<urlset/>", {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600, s-maxage=86400",
					},
				})
		);

		expect(response.headers.get("cache-control")).toBe(
			"public, max-age=3600, s-maxage=86400"
		);
	});

	it("adds the header to a response whose headers cannot change", async () => {
		const response = await serve("/old-path", () =>
			Response.redirect("http://localhost/new-path", 308)
		);

		expect(response.status).toBe(308);
		expect(response.headers.get("location")).toBe("http://localhost/new-path");
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});
});

describe("request bodies", () => {
	it("refuses an oversized server-function body before the handler runs", async () => {
		const handler = vi.fn(() => new Response(null, { status: 204 }));
		const response = await serve("/_serverFn/dummy-fn-id", handler, null, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"content-length": String(64 * 1024 * 1024),
			},
		});

		expect(response.status).toBe(413);
		expect(handler).not.toHaveBeenCalled();
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});
});
