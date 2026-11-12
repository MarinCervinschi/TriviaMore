import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { APIError } from "better-auth/api";
import { describe, expect, it } from "vitest";

const ORIGIN = "http://localhost:3000";
const IP = "203.0.113.9";
const CREDENTIALS = { email: "nessuno@example.test", password: "Sbagliata1" };

function auth() {
	return betterAuth({
		baseURL: ORIGIN,
		secret: "dummy".repeat(8),
		database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
		emailAndPassword: { enabled: true },
		rateLimit: { enabled: true, storage: "memory" },
		advanced: { ipAddress: { ipAddressHeaders: ["x-real-ip"] } },
		logger: { level: "error" },
	});
}

describe("Better Auth's own rate limiter", () => {
	it("never limits a direct auth.api call", async () => {
		const instance = auth();
		const statuses: unknown[] = [];
		for (let attempt = 0; attempt < 6; attempt++) {
			try {
				await instance.api.signInEmail({
					body: CREDENTIALS,
					headers: new Headers({ "x-real-ip": IP }),
				});
			} catch (error) {
				statuses.push(error instanceof APIError ? error.status : error);
			}
		}
		expect(statuses).toEqual(Array(6).fill("UNAUTHORIZED"));
	});

	it("answers 429 on the fourth sign-in through the router", async () => {
		const instance = auth();
		const statuses: number[] = [];
		for (let attempt = 0; attempt < 4; attempt++) {
			const response = await instance.handler(
				new Request(`${ORIGIN}/api/auth/sign-in/email`, {
					method: "POST",
					headers: {
						origin: ORIGIN,
						"content-type": "application/json",
						"x-real-ip": IP,
					},
					body: JSON.stringify(CREDENTIALS),
				})
			);
			statuses.push(response.status);
		}
		expect(statuses).toEqual([401, 401, 401, 429]);
	});
});
