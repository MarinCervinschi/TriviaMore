import { describe, expect, it, vi } from "vitest";

import {
	type LimiterOptions,
	type Rules,
	compareLimits,
	createLimiter,
} from "./limiter";

const RULES = {
	"login-fail": [
		{ per: ["email"], max: 2, seconds: 60 },
		{ per: ["ip"], max: 3, seconds: 60 },
	],
	contact: [
		{ per: ["ip"], max: 1, seconds: 60 },
		{ per: [], max: 2, seconds: 60 },
	],
} as const satisfies Rules;

const URL = "http://limitador:8080";
const KEYS = { email: "hash-a", ip: "203.0.113.1" };

type Call = { url: string; init?: RequestInit };
type Answer = (call: Call) => Response | Promise<Response>;

function status(code: number): Answer {
	return () => new Response(null, { status: code });
}

const refused: Answer = () => Promise.reject(new TypeError("fetch failed"));

const hangs: Answer = ({ init }) =>
	new Promise((_, reject) =>
		init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))
	);

function setup(answer: Answer, options: Partial<LimiterOptions<typeof RULES>> = {}) {
	const calls: Call[] = [];
	const log = { info: vi.fn(), error: vi.fn() };
	let clock = 1_000_000;
	let respond = answer;
	const limiter = createLimiter({
		rules: RULES,
		limitador: { url: URL, namespace: "app" },
		log,
		fetch: async (input, init) => {
			const call = { url: String(input), init };
			calls.push(call);
			return respond(call);
		},
		now: () => clock,
		...options,
	});
	return {
		limiter,
		calls,
		log,
		advance: (ms: number) => (clock += ms),
		answer: (next: Answer) => (respond = next),
	};
}

describe("a limiter with Limitador", () => {
	it("asks /check with every key of the rule and allows on 200", async () => {
		const { limiter, calls } = setup(status(200));

		expect(await limiter.check("login-fail", KEYS)).toBe(true);
		expect(calls).toHaveLength(1);
		expect(calls[0].url).toBe(`${URL}/check`);
		expect(calls[0].init?.method).toBe("POST");
		expect(new Headers(calls[0].init?.headers).get("content-type")).toBe(
			"application/json"
		);
		expect(JSON.parse(String(calls[0].init?.body))).toEqual({
			namespace: "app",
			values: { email: "hash-a", ip: "203.0.113.1", rule: "login-fail" },
			delta: 1,
		});
	});

	it("limits on 429", async () => {
		const { limiter } = setup(status(429));

		expect(await limiter.check("login-fail", KEYS)).toBe(false);
		expect(await limiter.checkAndReport("contact", { ip: KEYS.ip })).toBe(false);
	});

	it("reports to /report and check-and-reports to /check_and_report", async () => {
		const { limiter, calls } = setup(status(200));

		await limiter.report("login-fail", KEYS);
		await limiter.checkAndReport("contact", { ip: KEYS.ip });

		expect(calls.map(call => call.url)).toEqual([
			`${URL}/report`,
			`${URL}/check_and_report`,
		]);
	});

	it("follows Limitador when it allows more than the in-process counts", async () => {
		const { limiter } = setup(status(200));

		await limiter.report("login-fail", KEYS);
		await limiter.report("login-fail", KEYS);

		expect(await limiter.check("login-fail", KEYS)).toBe(true);
	});

	it("sends nothing and throws when a key of the rule is empty", async () => {
		const { limiter, calls } = setup(status(200));

		await expect(
			limiter.check("login-fail", { email: "hash-a", ip: "" })
		).rejects.toThrow("needs a value for ip");
		// @ts-expect-error the rule also counts per email
		await expect(limiter.check("login-fail", { ip: KEYS.ip })).rejects.toThrow();
		expect(calls).toHaveLength(0);
	});
});

describe("a limiter whose Limitador does not answer", () => {
	it("gives up after the timeout and lets the in-process counts decide", async () => {
		const { limiter, log } = setup(hangs, { timeoutMs: 20 });

		const started = performance.now();
		expect(await limiter.check("login-fail", KEYS)).toBe(true);
		expect(performance.now() - started).toBeLessThan(1000);
		expect(log.error).toHaveBeenCalledOnce();
	});

	it("keeps counting in process while Limitador answers, so a later outage starts from the same counts", async () => {
		const { limiter, answer } = setup(status(200));

		await limiter.report("login-fail", KEYS);
		await limiter.report("login-fail", KEYS);
		answer(refused);

		expect(await limiter.check("login-fail", KEYS)).toBe(false);
		expect(await limiter.check("login-fail", { ...KEYS, email: "hash-b" })).toBe(true);
	});

	it("stops asking for the retry period, logs once, and logs when Limitador is back", async () => {
		const { limiter, calls, log, advance, answer } = setup(refused, {
			retryAfterMs: 30_000,
		});

		await limiter.check("login-fail", KEYS);
		await limiter.check("login-fail", KEYS);
		expect(calls).toHaveLength(1);

		advance(30_000);
		await limiter.check("login-fail", KEYS);
		expect(calls).toHaveLength(2);
		expect(log.error).toHaveBeenCalledOnce();

		advance(30_000);
		answer(status(429));
		expect(await limiter.check("login-fail", KEYS)).toBe(false);
		expect(log.info).toHaveBeenCalledWith("Limitador answers again");
	});

	it("treats any status other than 200 and 429 as no answer", async () => {
		const { limiter, log } = setup(status(400));

		expect(await limiter.checkAndReport("contact", { ip: KEYS.ip })).toBe(true);
		expect(await limiter.checkAndReport("contact", { ip: KEYS.ip })).toBe(false);
		expect(log.error).toHaveBeenCalledOnce();
	});
});

describe("a limiter without Limitador", () => {
	function local(options: Partial<LimiterOptions<typeof RULES>> = {}) {
		return setup(status(500), { limitador: undefined, ...options });
	}

	it("never calls out", async () => {
		const { limiter, calls } = local();

		await limiter.check("login-fail", KEYS);
		await limiter.report("login-fail", KEYS);
		await limiter.checkAndReport("contact", { ip: KEYS.ip });

		expect(calls).toHaveLength(0);
	});

	it("applies every limit of the rule: per key and in total", async () => {
		const { limiter } = local();

		expect(await limiter.checkAndReport("contact", { ip: "203.0.113.1" })).toBe(true);
		expect(await limiter.checkAndReport("contact", { ip: "203.0.113.1" })).toBe(false);
		expect(await limiter.checkAndReport("contact", { ip: "203.0.113.2" })).toBe(true);
		expect(await limiter.checkAndReport("contact", { ip: "203.0.113.3" })).toBe(false);
	});

	it("limits a failed sign-in per email and per IP", async () => {
		const { limiter } = local();

		await limiter.report("login-fail", KEYS);
		await limiter.report("login-fail", KEYS);
		expect(await limiter.check("login-fail", KEYS)).toBe(false);

		await limiter.report("login-fail", { ...KEYS, email: "hash-b" });
		expect(await limiter.check("login-fail", { ...KEYS, email: "hash-c" })).toBe(false);
		expect(
			await limiter.check("login-fail", { email: "hash-c", ip: "203.0.113.2" })
		).toBe(true);
	});

	it("opens a new window once the old one ends", async () => {
		const { limiter, advance } = local();

		await limiter.checkAndReport("contact", { ip: KEYS.ip });
		advance(59_999);
		expect(await limiter.check("contact", { ip: KEYS.ip })).toBe(false);
		advance(1);
		expect(await limiter.check("contact", { ip: KEYS.ip })).toBe(true);
	});

	it("evicts the oldest counter once it holds the maximum", async () => {
		const { limiter } = local({ maxCounters: 2 });

		await limiter.report("login-fail", KEYS);
		await limiter.report("login-fail", KEYS);
		expect(await limiter.check("login-fail", KEYS)).toBe(false);

		await limiter.report("login-fail", { email: "hash-b", ip: "203.0.113.2" });
		expect(await limiter.check("login-fail", KEYS)).toBe(true);
	});
});

const LIMITADOR_LIMITS = [
	{
		id: null,
		namespace: "app",
		max_value: 2,
		seconds: 60,
		name: "login-fail-per-email",
		conditions: ["descriptors[0].rule == 'login-fail'"],
		variables: ["descriptors[0].email"],
	},
	{
		id: null,
		namespace: "app",
		max_value: 3,
		seconds: 60,
		name: "login-fail-per-ip",
		conditions: ["descriptors[0].rule == 'login-fail'"],
		variables: ["descriptors[0].ip"],
	},
	{
		id: null,
		namespace: "app",
		max_value: 1,
		seconds: 60,
		name: "contact-per-ip",
		conditions: ["descriptors[0].rule == 'contact'"],
		variables: ["descriptors[0].ip"],
	},
	{
		id: null,
		namespace: "app",
		max_value: 2,
		seconds: 60,
		name: "contact-total",
		conditions: ['descriptors[0].rule == "contact"'],
		variables: [],
	},
];

describe("compareLimits", () => {
	it("finds nothing when Limitador has the same limits", () => {
		expect(compareLimits(RULES, LIMITADOR_LIMITS)).toEqual([]);
	});

	it("reports a rule Limitador has no limit for", () => {
		const limits = LIMITADOR_LIMITS.filter(limit => !limit.name.startsWith("contact"));

		expect(compareLimits(RULES, limits)).toEqual([
			{ kind: "missing", rule: "contact" },
		]);
	});

	it("reports a key Limitador counts per that the rule does not send", () => {
		const limits = LIMITADOR_LIMITS.map(limit =>
			limit.name === "contact-per-ip"
				? { ...limit, variables: ["descriptors[0].email"] }
				: limit
		);

		expect(compareLimits(RULES, limits)).toContainEqual({
			kind: "unsent-key",
			rule: "contact",
			limit: "contact-per-ip",
			key: "email",
		});
	});

	it("reports values that differ from the in-process limits", () => {
		const limits = LIMITADOR_LIMITS.map(limit =>
			limit.name === "contact-total" ? { ...limit, max_value: 30 } : limit
		);

		expect(compareLimits(RULES, limits)).toEqual([
			{
				kind: "drift",
				rule: "contact",
				limitador: ["ip 1/60s", "total 30/60s"],
				local: ["ip 1/60s", "total 2/60s"],
			},
		]);
	});
});

describe("verify", () => {
	it("reads the limits of the namespace", async () => {
		const { limiter, calls } = setup(() => Response.json(LIMITADOR_LIMITS));

		expect(await limiter.verify()).toEqual([]);
		expect(calls[0].url).toBe(`${URL}/limits/app`);
	});

	it("decides in process a rule Limitador lacks, since Limitador would allow it", async () => {
		const limits = LIMITADOR_LIMITS.filter(limit => !limit.name.startsWith("contact"));
		const { limiter, calls, answer } = setup(() => Response.json(limits));
		await limiter.verify();
		answer(status(200));

		expect(await limiter.checkAndReport("contact", { ip: KEYS.ip })).toBe(true);
		expect(await limiter.checkAndReport("contact", { ip: KEYS.ip })).toBe(false);
		await limiter.check("login-fail", KEYS);
		expect(calls.map(call => call.url)).toEqual([`${URL}/limits/app`, `${URL}/check`]);
	});

	it("throws when Limitador cannot be read", async () => {
		const { limiter } = setup(status(500));

		await expect(limiter.verify()).rejects.toThrow("500");
	});

	it("has nothing to compare without Limitador", async () => {
		const { limiter, calls } = setup(status(200), { limitador: undefined });

		expect(await limiter.verify()).toEqual([]);
		expect(calls).toHaveLength(0);
	});
});
