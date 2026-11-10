import { getRequestHeaders } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";

import { log } from "@/lib/logging/server";

import { clientIp } from "./client-ip";
import { type Limiter, type Rules, createLimiter } from "./limiter";

const DEFAULT_TIMEOUT_MS = 50;

// The same values as Limitador's limits for the app; these decide only while Limitador does not answer.
const RULES = {
	"login-fail": [
		{ per: ["email"], max: 5, seconds: 15 * 60 },
		{ per: ["ip"], max: 20, seconds: 15 * 60 },
	],
	"auth-mail": [
		{ per: ["email"], max: 3, seconds: 60 * 60 },
		{ per: ["ip"], max: 10, seconds: 60 * 60 },
		{ per: [], max: 200, seconds: 60 * 60 },
	],
	contact: [
		{ per: ["ip"], max: 3, seconds: 60 * 60 },
		{ per: [], max: 30, seconds: 60 * 60 },
	],
} as const satisfies Rules;

type Settings =
	| { limitador: { url: string; namespace: string } }
	| { limitador?: undefined; unset: "LIMITADOR_URL" | "LIMITADOR_NAMESPACE" };

/** Limitador's address and namespace, or the setting whose absence leaves only the in-process limits. */
export function limiterSettings(env: NodeJS.ProcessEnv): Settings {
	const url = env.LIMITADOR_URL?.trim().replace(/\/+$/, "");
	const namespace = env.LIMITADOR_NAMESPACE?.trim();
	if (!url) return { unset: "LIMITADOR_URL" };
	if (!namespace) return { unset: "LIMITADOR_NAMESPACE" };
	return { limitador: { url, namespace } };
}

/** `LIMITADOR_TIMEOUT_MS` when it is a positive number of milliseconds, else 50. */
export function limiterTimeout(env: NodeJS.ProcessEnv): number {
	const value = Number(env.LIMITADOR_TIMEOUT_MS);
	return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

let limiter: Limiter<typeof RULES> | undefined;

/** The app's limiter, built on first use so the settings are loaded by then. */
export function rateLimiter() {
	limiter ??= createLimiter({
		rules: RULES,
		limitador: limiterSettings(process.env).limitador,
		timeoutMs: limiterTimeout(process.env),
		log,
	});
	return limiter;
}

/** The client IP of the current request; one key shared by every request that lacks it. */
export function requestIp(): string {
	return clientIp(getRequestHeaders()) ?? "unknown";
}

/** An email address as a counter key, case-folded and hashed so Limitador never stores it. */
export function emailKey(email: string): string {
	return createHash("sha256").update(email.trim().toLowerCase()).digest("base64url");
}

/** Logs whether Limitador knows every rule the app sends; never throws. */
export async function verifyRateLimits(): Promise<void> {
	const settings = limiterSettings(process.env);
	if (!settings.limitador) {
		const level = settings.unset === "LIMITADOR_URL" ? "warn" : "error";
		log[level]("Rate limits are counted in this process only, {Setting} is unset", {
			Setting: settings.unset,
		});
		return;
	}

	const { namespace } = settings.limitador;
	try {
		const problems = await rateLimiter().verify();
		for (const problem of problems) {
			if (problem.kind === "missing") {
				log.error(
					"Limitador has no limit for rule {Rule} in {Namespace}, decided in process",
					{
						Rule: problem.rule,
						Namespace: namespace,
					}
				);
			} else if (problem.kind === "unsent-key") {
				log.error(
					"Limitador limit {Limit} counts per {Key}, which {Rule} does not send; decided in process",
					{
						Limit: problem.limit,
						Key: problem.key,
						Rule: problem.rule,
					}
				);
			} else {
				log.warn("Rule {Rule} allows {Limitador} in Limitador and {Local} in process", {
					Rule: problem.rule,
					Limitador: problem.limitador,
					Local: problem.local,
				});
			}
		}
		if (problems.length === 0) {
			log.info("Limitador knows every rate limit rule in namespace {Namespace}", {
				Namespace: namespace,
			});
		}
	} catch (error) {
		log.error(
			"Could not read the limits of namespace {Namespace} from Limitador",
			{
				Namespace: namespace,
			},
			error
		);
	}
}
