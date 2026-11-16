import { afterEach, describe, expect, it, vi } from "vitest";

import { SOURCE_HOSTS } from "./documents";
import { forwardToSource } from "./proxy";

vi.mock("~/lib/auth/service", () => ({
	getConsoleSession: async () => ({ userId: null, email: null }),
}));

const SOURCE = [...SOURCE_HOSTS][0];

function proxied(headers: Record<string, string> = {}) {
	const target = encodeURIComponent(`https://${SOURCE}/page`);
	return new Request(`https://admin.trivia-more.it/api/proxy?scalar_url=${target}`, {
		headers,
	});
}

describe("forwardToSource", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("relays an HTML response as an inert attachment", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response("<script>alert(1)</script>", {
						status: 200,
						headers: { "content-type": "text/html" },
					})
			)
		);
		const response = await forwardToSource(proxied({ "sec-fetch-dest": "empty" }));
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("text/html");
		expect(response.headers.get("content-security-policy")).toBe(
			"sandbox; default-src 'none'"
		);
		expect(response.headers.get("x-content-type-options")).toBe("nosniff");
		expect(response.headers.get("content-disposition")).toBe("attachment");
	});

	it("refuses a navigation before reaching the source", async () => {
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		const response = await forwardToSource(proxied({ "sec-fetch-dest": "document" }));
		expect(response.status).toBe(403);
		expect(response.headers.get("content-security-policy")).toBe(
			"sandbox; default-src 'none'"
		);
		expect(fetch).not.toHaveBeenCalled();
	});
});
