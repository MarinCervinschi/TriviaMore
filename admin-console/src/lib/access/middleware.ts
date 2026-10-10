import { createMiddleware } from "@tanstack/react-start";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { log } from "@/lib/logging/server";

import { IS_PRODUCTION } from "~/lib/environment";

/** Cloudflare Access signs every request it lets through; the console checks it, since the server's IP reaches Traefik without Cloudflare. */
const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN;
const AUDIENCE = process.env.CF_ACCESS_AUD;

const keys = TEAM_DOMAIN
	? createRemoteJWKSet(new URL("/cdn-cgi/access/certs", TEAM_DOMAIN))
	: null;

const denied = (status: number, reason: string) =>
	new Response(reason, {
		status,
		headers: { "content-type": "text/plain; charset=utf-8" },
	});

export const accessMiddleware = createMiddleware({ type: "request" }).server(
	async ({ request, pathname, next }) => {
		if (!keys || !AUDIENCE) {
			// Locally there is no Access in front; a deployed console without it refuses everything.
			return IS_PRODUCTION
				? denied(503, "Cloudflare Access non è configurato.")
				: next();
		}

		const token = request.headers.get("cf-access-jwt-assertion");
		if (!token) return denied(403, "Accesso solo attraverso Cloudflare Access.");

		try {
			await jwtVerify(token, keys, { issuer: TEAM_DOMAIN, audience: AUDIENCE });
		} catch (error) {
			log.warn("Cloudflare Access token rejected on {Path}: {Reason}", {
				Path: pathname,
				Reason: error instanceof Error ? error.message : String(error),
			});
			return denied(403, "Accesso solo attraverso Cloudflare Access.");
		}
		return next();
	}
);
