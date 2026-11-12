import { describe, expect, it } from "vitest";

import {
	MAX_MULTIPART_BYTES,
	MAX_OTHER_BYTES,
	MAX_SERVER_FN_JSON_BYTES,
	bodyLimitStatus,
} from "./body-limit";

const FN = "/_serverFn/dummy-fn-id";

function request(method: string, headers: Record<string, string>): Request {
	return new Request("http://localhost/", { method, headers });
}

describe("bodyLimitStatus", () => {
	it("lets requests without a body through", () => {
		expect(bodyLimitStatus(request("GET", {}), FN)).toBeNull();
		expect(bodyLimitStatus(request("HEAD", {}), "/browse")).toBeNull();
	});

	it("lets a POST with neither a body type nor a length through, since nothing reads it", () => {
		expect(bodyLimitStatus(request("POST", {}), FN)).toBeNull();
	});

	it("refuses a typed body without a Content-Length", () => {
		expect(
			bodyLimitStatus(request("POST", { "content-type": "application/json" }), FN)
		).toBe(411);
	});

	it("refuses a chunked body", () => {
		expect(
			bodyLimitStatus(
				request("POST", { "transfer-encoding": "chunked", "content-length": "10" }),
				FN
			)
		).toBe(411);
	});

	it("refuses a Content-Length that is not a number", () => {
		expect(bodyLimitStatus(request("POST", { "content-length": "1e3" }), FN)).toBe(411);
	});

	it("caps server-function JSON", () => {
		const json = (length: number) =>
			request("POST", {
				"content-type": "application/json",
				"content-length": String(length),
			});
		expect(bodyLimitStatus(json(MAX_SERVER_FN_JSON_BYTES), FN)).toBeNull();
		expect(bodyLimitStatus(json(MAX_SERVER_FN_JSON_BYTES + 1), FN)).toBe(413);
	});

	it("allows a larger multipart body for uploads", () => {
		const form = (length: number) =>
			request("POST", {
				"content-type": "multipart/form-data; boundary=x",
				"content-length": String(length),
			});
		expect(bodyLimitStatus(form(MAX_MULTIPART_BYTES), FN)).toBeNull();
		expect(bodyLimitStatus(form(MAX_MULTIPART_BYTES + 1), FN)).toBe(413);
	});

	it("caps every other route lower, multipart included", () => {
		const post = (length: number) =>
			request("POST", {
				"content-type": "multipart/form-data; boundary=x",
				"content-length": String(length),
			});
		expect(
			bodyLimitStatus(post(MAX_OTHER_BYTES), "/api/auth/sign-in/email")
		).toBeNull();
		expect(bodyLimitStatus(post(MAX_OTHER_BYTES + 1), "/api/log")).toBe(413);
	});
});
