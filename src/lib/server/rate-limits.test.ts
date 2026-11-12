import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const log = vi.hoisted(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }));

vi.mock("@/lib/logging/server", () => ({ log }));

function limit(name: string, rule: string, max: number, seconds: number, key?: string) {
	return {
		id: null,
		namespace: "triviamore-test",
		max_value: max,
		seconds,
		name,
		conditions: [`descriptors[0].rule == '${rule}'`],
		variables: key ? [`descriptors[0].${key}`] : [],
	};
}

// The limits Limitador serves for the app, in the shape GET /limits/<namespace> returns them.
const DEPLOYED = [
	limit("login-fail-per-email", "login-fail", 5, 900, "email"),
	limit("login-fail-per-ip", "login-fail", 20, 900, "ip"),
	limit("auth-mail-per-email", "auth-mail", 3, 3600, "email"),
	limit("auth-mail-per-ip", "auth-mail", 10, 3600, "ip"),
	limit("auth-mail-total", "auth-mail", 200, 3600),
	limit("contact-per-ip", "contact", 3, 3600, "ip"),
	limit("contact-total", "contact", 30, 3600),
	limit("upload-per-user", "upload", 20, 3600, "user"),
	limit("upload-total", "upload", 300, 3600),
];

async function load() {
	vi.resetModules();
	return import("./rate-limits");
}

beforeEach(() => {
	vi.stubEnv("LIMITADOR_URL", "http://limitador:8080/");
	vi.stubEnv("LIMITADOR_NAMESPACE", "triviamore-test");
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe("limiterSettings", () => {
	it("reads the URL without its trailing slash and the namespace", async () => {
		const { limiterSettings } = await load();

		expect(limiterSettings(process.env)).toEqual({
			limitador: { url: "http://limitador:8080", namespace: "triviamore-test" },
		});
	});

	it("names LIMITADOR_URL when it is unset", async () => {
		const { limiterSettings } = await load();

		expect(limiterSettings({ LIMITADOR_NAMESPACE: "triviamore-test" })).toEqual({
			unset: "LIMITADOR_URL",
		});
	});

	it("names LIMITADOR_NAMESPACE when only the URL is set", async () => {
		const { limiterSettings } = await load();

		expect(
			limiterSettings({
				LIMITADOR_URL: "http://limitador:8080",
				LIMITADOR_NAMESPACE: " ",
			})
		).toEqual({
			unset: "LIMITADOR_NAMESPACE",
		});
	});
});

describe("limiterTimeout", () => {
	it("is 50 ms unless LIMITADOR_TIMEOUT_MS holds a positive number", async () => {
		const { limiterTimeout } = await load();

		expect(limiterTimeout({})).toBe(50);
		expect(limiterTimeout({ LIMITADOR_TIMEOUT_MS: "" })).toBe(50);
		expect(limiterTimeout({ LIMITADOR_TIMEOUT_MS: "-1" })).toBe(50);
		expect(limiterTimeout({ LIMITADOR_TIMEOUT_MS: "tanto" })).toBe(50);
		expect(limiterTimeout({ LIMITADOR_TIMEOUT_MS: "300" })).toBe(300);
	});
});

describe("rateLimiter", () => {
	it("counts in process when the namespace is unset", async () => {
		vi.stubEnv("LIMITADOR_NAMESPACE", undefined);
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		const { rateLimiter } = await load();

		const ip = { ip: "203.0.113.1" };
		const answers = [];
		for (let attempt = 0; attempt < 4; attempt++) {
			answers.push(await rateLimiter().checkAndReport("contact", ip));
		}

		expect(answers).toEqual([true, true, true, false]);
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("verifyRateLimits", () => {
	it("finds every rule of the app in the deployed limits", async () => {
		const fetch = vi.fn(async () => Response.json(DEPLOYED));
		vi.stubGlobal("fetch", fetch);
		const { verifyRateLimits } = await load();

		await verifyRateLimits();

		expect(fetch).toHaveBeenCalledWith(
			"http://limitador:8080/limits/triviamore-test",
			expect.anything()
		);
		expect(log.error).not.toHaveBeenCalled();
		expect(log.warn).not.toHaveBeenCalled();
		expect(log.info).toHaveBeenCalledOnce();
	});

	it("logs an error for a rule Limitador lacks", async () => {
		const deployed = DEPLOYED.filter(entry => !entry.name.startsWith("contact"));
		vi.stubGlobal("fetch", async () => Response.json(deployed));
		const { verifyRateLimits } = await load();

		await verifyRateLimits();

		expect(log.error).toHaveBeenCalledWith(
			expect.stringContaining("no limit for rule"),
			{
				Rule: "contact",
				Namespace: "triviamore-test",
			}
		);
	});

	it("logs an error when Limitador cannot be reached", async () => {
		vi.stubGlobal("fetch", async () => {
			throw new TypeError("fetch failed");
		});
		const { verifyRateLimits } = await load();

		await expect(verifyRateLimits()).resolves.toBeUndefined();
		expect(log.error).toHaveBeenCalledOnce();
	});

	it("logs an error when the namespace is unset", async () => {
		vi.stubEnv("LIMITADOR_NAMESPACE", undefined);
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		const { verifyRateLimits } = await load();

		await verifyRateLimits();

		expect(log.error).toHaveBeenCalledWith(expect.any(String), {
			Setting: "LIMITADOR_NAMESPACE",
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	it("only warns when the URL is unset", async () => {
		vi.stubEnv("LIMITADOR_URL", undefined);
		const { verifyRateLimits } = await load();

		await verifyRateLimits();

		expect(log.warn).toHaveBeenCalledWith(expect.any(String), {
			Setting: "LIMITADOR_URL",
		});
		expect(log.error).not.toHaveBeenCalled();
	});
});

describe("emailKey", () => {
	it("gives one key per address whatever its case, and does not contain it", async () => {
		const { emailKey } = await load();

		expect(emailKey(" Mario.Rossi@Example.test ")).toBe(
			emailKey("mario.rossi@example.test")
		);
		expect(emailKey("mario.rossi@example.test")).not.toContain("mario");
		expect(emailKey("a@example.test")).not.toBe(emailKey("b@example.test"));
	});
});
