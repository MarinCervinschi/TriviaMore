/** At most `max` events per `seconds`, in a fixed window that opens at the first event. */
export type Limit = {
	/** The keys the counter is kept per; empty for one counter shared by every caller. */
	per: readonly string[];
	max: number;
	seconds: number;
};

export type Rules = Record<string, readonly Limit[]>;

export type KeyValues<L extends readonly Limit[]> = Record<
	L[number]["per"][number],
	string
>;

export type LimiterLog = {
	info(template: string, properties?: Record<string, unknown>): void;
	error(template: string, properties?: Record<string, unknown>, error?: unknown): void;
};

export type LimiterOptions<R extends Rules> = {
	/** The in-process limits, which decide whenever Limitador does not answer. */
	rules: R;
	/** Without it, only the in-process limits decide. */
	limitador?: { url: string; namespace: string };
	log: LimiterLog;
	timeoutMs?: number;
	/** How long the in-process limits decide alone after Limitador fails to answer. */
	retryAfterMs?: number;
	maxCounters?: number;
	fetch?: typeof fetch;
	now?: () => number;
};

export type LimitProblem =
	| { kind: "missing"; rule: string }
	| { kind: "unsent-key"; rule: string; limit: string; key: string }
	| { kind: "drift"; rule: string; limitador: string[]; local: string[] };

type LimitadorLimit = {
	name?: string | null;
	max_value: number;
	seconds: number;
	conditions: string[];
	variables: string[];
};

type Answer = "allowed" | "limited" | "unavailable";

const RULE_CONDITION = /^descriptors\[0\]\.rule\s*==\s*(["'])(.*)\1$/;
const VARIABLE = /^descriptors\[0\]\.(.+)$/;

function keysOf(limits: readonly Limit[]): string[] {
	return [...new Set(limits.flatMap(limit => limit.per))];
}

function signature(per: readonly string[], max: number, seconds: number): string {
	return `${[...per].sort().join("+") || "total"} ${max}/${seconds}s`;
}

function ruleOf(limit: LimitadorLimit): string | undefined {
	for (const condition of limit.conditions) {
		const match = condition.trim().match(RULE_CONDITION);
		if (match) return match[2];
	}
	return undefined;
}

/** What makes Limitador's limits disagree with the rules the app sends. */
export function compareLimits(rules: Rules, limits: LimitadorLimit[]): LimitProblem[] {
	const problems: LimitProblem[] = [];
	for (const [rule, local] of Object.entries(rules)) {
		const remote = limits.filter(limit => ruleOf(limit) === rule);
		if (remote.length === 0) {
			problems.push({ kind: "missing", rule });
			continue;
		}

		const sent = new Set(keysOf(local));
		const remoteSignatures: string[] = [];
		for (const limit of remote) {
			const keys = limit.variables.map(
				variable => variable.match(VARIABLE)?.[1] ?? variable
			);
			for (const key of keys.filter(key => !sent.has(key))) {
				problems.push({ kind: "unsent-key", rule, limit: limit.name ?? rule, key });
			}
			remoteSignatures.push(signature(keys, limit.max_value, limit.seconds));
		}

		const localSignatures = local.map(limit =>
			signature(limit.per, limit.max, limit.seconds)
		);
		const same =
			remoteSignatures.length === localSignatures.length &&
			remoteSignatures.every(entry => localSignatures.includes(entry));
		if (!same) {
			problems.push({
				kind: "drift",
				rule,
				limitador: remoteSignatures.sort(),
				local: localSignatures.sort(),
			});
		}
	}
	return problems;
}

/** Fixed-window counters held in this process, the oldest evicted first once `max` are kept. */
function createCounters(max: number, now: () => number) {
	const windows = new Map<string, { count: number; endsAt: number }>();

	function live(key: string) {
		const window = windows.get(key);
		if (window && window.endsAt > now()) return window;
		if (window) windows.delete(key);
		return undefined;
	}

	function evict() {
		const at = now();
		for (const [key, window] of windows) if (window.endsAt <= at) windows.delete(key);
		for (const key of windows.keys()) {
			if (windows.size < max) break;
			windows.delete(key);
		}
	}

	return {
		count: (key: string) => live(key)?.count ?? 0,
		add(key: string, seconds: number) {
			const window = live(key);
			if (window) {
				window.count += 1;
				return;
			}
			if (windows.size >= max) evict();
			windows.set(key, { count: 1, endsAt: now() + seconds * 1000 });
		},
	};
}

/** Asks Limitador, and lets the counts it keeps in process decide when Limitador does not answer within `timeoutMs`. */
export function createLimiter<const R extends Rules>(options: LimiterOptions<R>) {
	const { rules, limitador, log } = options;
	const timeoutMs = options.timeoutMs ?? 50;
	const retryAfterMs = options.retryAfterMs ?? 30_000;
	const now = options.now ?? Date.now;
	const send = options.fetch ?? ((input, init) => fetch(input, init));
	const counters = createCounters(options.maxCounters ?? 50_000, now);

	let downUntil = 0;
	let down = false;
	const unenforced = new Set<string>();

	function valuesOf(rule: string, values: Record<string, string>) {
		const limits = rules[rule];
		if (!limits) throw new Error(`Unknown rate limit rule ${rule}`);
		const picked: Record<string, string> = {};
		for (const key of keysOf(limits)) {
			const value = values[key];
			if (typeof value !== "string" || value === "") {
				throw new Error(`Rate limit rule ${rule} needs a value for ${key}`);
			}
			picked[key] = value;
		}
		return { limits, picked };
	}

	function counterKeys(
		rule: string,
		limits: readonly Limit[],
		values: Record<string, string>
	) {
		return limits.map((limit, index) =>
			JSON.stringify([rule, index, ...limit.per.map(key => values[key])])
		);
	}

	function allowedHere(
		rule: string,
		limits: readonly Limit[],
		values: Record<string, string>
	) {
		const keys = counterKeys(rule, limits, values);
		return limits.every((limit, index) => counters.count(keys[index]) < limit.max);
	}

	function countHere(
		rule: string,
		limits: readonly Limit[],
		values: Record<string, string>
	) {
		const keys = counterKeys(rule, limits, values);
		limits.forEach((limit, index) => counters.add(keys[index], limit.seconds));
	}

	async function ask(
		path: "check" | "report" | "check_and_report",
		rule: string,
		values: Record<string, string>
	): Promise<Answer> {
		if (!limitador || unenforced.has(rule) || now() < downUntil) return "unavailable";
		try {
			const response = await send(`${limitador.url}/${path}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					namespace: limitador.namespace,
					values: { ...values, rule },
					delta: 1,
				}),
				signal: AbortSignal.timeout(timeoutMs),
			});
			void response.body?.cancel().catch(() => {});
			if (response.status !== 200 && response.status !== 429) {
				throw new Error(`Limitador answered ${response.status}`);
			}
			if (down) log.info("Limitador answers again");
			down = false;
			return response.status === 200 ? "allowed" : "limited";
		} catch (error) {
			downUntil = now() + retryAfterMs;
			if (!down) {
				log.error(
					"Limitador did not answer, in-process limits decide for {Seconds} s",
					{ Seconds: retryAfterMs / 1000 },
					error
				);
			}
			down = true;
			return "unavailable";
		}
	}

	return {
		/** True when one more event stays within every limit of the rule; counts nothing. */
		async check<K extends keyof R & string>(rule: K, values: KeyValues<R[K]>) {
			const { limits, picked } = valuesOf(rule, values);
			const answer = await ask("check", rule, picked);
			if (answer === "unavailable") return allowedHere(rule, limits, picked);
			return answer === "allowed";
		},

		/** Counts one event. */
		async report<K extends keyof R & string>(rule: K, values: KeyValues<R[K]>) {
			const { limits, picked } = valuesOf(rule, values);
			countHere(rule, limits, picked);
			await ask("report", rule, picked);
		},

		/** Counts one event only when it stays within every limit, and says whether it did. */
		async checkAndReport<K extends keyof R & string>(rule: K, values: KeyValues<R[K]>) {
			const { limits, picked } = valuesOf(rule, values);
			const answer = await ask("check_and_report", rule, picked);
			const allowed =
				answer === "unavailable"
					? allowedHere(rule, limits, picked)
					: answer === "allowed";
			if (allowed) countHere(rule, limits, picked);
			return allowed;
		},

		/** Compares Limitador's limits with the rules, and decides in process each rule they leave unenforced. */
		async verify(): Promise<LimitProblem[]> {
			if (!limitador) return [];
			const response = await send(
				`${limitador.url}/limits/${encodeURIComponent(limitador.namespace)}`,
				{ signal: AbortSignal.timeout(Math.max(timeoutMs, 2000)) }
			);
			if (!response.ok) throw new Error(`Limitador answered ${response.status}`);
			const problems = compareLimits(
				rules,
				(await response.json()) as LimitadorLimit[]
			);
			unenforced.clear();
			for (const problem of problems) {
				if (problem.kind !== "drift") unenforced.add(problem.rule);
			}
			return problems;
		},
	};
}

export type Limiter<R extends Rules> = ReturnType<typeof createLimiter<R>>;
