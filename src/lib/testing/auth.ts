import { eq } from "drizzle-orm";

import { accounts, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/rules";
import { getAuth } from "@/lib/auth/server";
import type { AuthUser } from "@/lib/auth/types";

import type { TestTx } from "./db";
import { createUser } from "./fixtures";

export const AUTH_ORIGIN = "http://localhost:3000";
export const TEST_PASSWORD = "Dummy1234";

/** The variables `createAuth` reads, set before the first `getAuth()`. */
export function setAuthEnv() {
	process.env.BETTER_AUTH_URL = AUTH_ORIGIN;
	process.env.BETTER_AUTH_SECRET = "dummy".repeat(8);
	delete process.env.AUTH_ALLOWED_EMAIL_DOMAIN;
}

/** A verified user who signs in with `TEST_PASSWORD`. */
export async function createPasswordUser(
	tx: TestTx,
	role: AuthUser["role"] = "STUDENT"
): Promise<{ id: string; email: string }> {
	const id = await createUser(tx, role);
	await tx.update(users).set({ emailVerified: true }).where(eq(users.id, id));
	await tx.insert(accounts).values({
		userId: id,
		providerId: "credential",
		accountId: id,
		password: await hashPassword(TEST_PASSWORD),
	});
	return { id, email: `${id}@example.test` };
}

/** Sends requests to the Better Auth router and keeps the cookies it sets, as a browser would. */
export function authClient() {
	const jar = new Map<string, string>();
	const cookie = () => [...jar].map(([name, value]) => `${name}=${value}`).join("; ");

	async function send(method: "GET" | "POST", path: string, body?: unknown) {
		const headers = new Headers({ origin: AUTH_ORIGIN, cookie: cookie() });
		if (body !== undefined) headers.set("content-type", "application/json");
		const response = await getAuth().handler(
			new Request(`${AUTH_ORIGIN}/api/auth${path}`, {
				method,
				headers,
				body: body === undefined ? undefined : JSON.stringify(body),
			})
		);
		for (const line of response.headers.getSetCookie()) {
			const [pair] = line.split(";");
			const name = pair.slice(0, pair.indexOf("="));
			const value = pair.slice(pair.indexOf("=") + 1);
			if (value === "" || /max-age=0/i.test(line)) jar.delete(name);
			else jar.set(name, value);
		}
		return response;
	}

	return {
		get: (path: string) => send("GET", path),
		post: (path: string, body: unknown) => send("POST", path, body),
		headers: () => new Headers({ cookie: cookie() }),
	};
}
