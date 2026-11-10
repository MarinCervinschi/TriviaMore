import { afterEach, describe, expect, it, vi } from "vitest";

import { clientIp, clientIpHeader } from "./client-ip";

describe("clientIp", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("reads cf-connecting-ip when CLIENT_IP_HEADER is unset", () => {
		vi.stubEnv("CLIENT_IP_HEADER", undefined);

		expect(clientIpHeader()).toBe("cf-connecting-ip");
		expect(clientIp(new Headers({ "cf-connecting-ip": " 203.0.113.7 " }))).toBe(
			"203.0.113.7"
		);
	});

	it("returns null when the header is absent", () => {
		vi.stubEnv("CLIENT_IP_HEADER", undefined);

		expect(clientIp(new Headers())).toBeNull();
	});

	it("reads the header CLIENT_IP_HEADER names", () => {
		vi.stubEnv("CLIENT_IP_HEADER", "X-Real-IP");

		expect(clientIp(new Headers({ "x-real-ip": "2001:db8::1" }))).toBe("2001:db8::1");
	});

	it("ignores cf-connecting-ip and x-forwarded-for when another header is configured", () => {
		vi.stubEnv("CLIENT_IP_HEADER", "x-real-ip");

		const headers = new Headers({
			"cf-connecting-ip": "198.51.100.1",
			"x-forwarded-for": "198.51.100.2, 198.51.100.3",
		});
		expect(clientIp(headers)).toBeNull();
	});

	it("returns null when the header holds something other than one address", () => {
		vi.stubEnv("CLIENT_IP_HEADER", "x-forwarded-for");

		expect(
			clientIp(new Headers({ "x-forwarded-for": "198.51.100.2, 198.51.100.3" }))
		).toBeNull();
		expect(clientIp(new Headers({ "x-forwarded-for": "   " }))).toBeNull();
	});
});
