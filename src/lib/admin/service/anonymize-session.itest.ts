import { and, eq } from "drizzle-orm";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { accounts, sessions } from "@/db/schema";
import { getAuth } from "@/lib/auth/server";
import { getSession } from "@/lib/auth/service";
import { Unauthorized } from "@/lib/server/errors";
import { authMiddleware, optionalAuthMiddleware } from "@/lib/server/middleware/auth";
import {
	TEST_PASSWORD,
	authClient,
	createPasswordUser,
	setAuthEnv,
} from "@/lib/testing/auth";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";

import { anonymizeUser } from "./anonymize";

const request = vi.hoisted(() => ({ headers: new Headers() }));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@tanstack/react-start/server", async importOriginal => ({
	...(await importOriginal<typeof import("@tanstack/react-start/server")>()),
	getRequestHeaders: () => request.headers,
}));

setAuthEnv();
process.env.GOOGLE_CLIENT_ID = "dummy";
process.env.GOOGLE_CLIENT_SECRET = "dummy";

const MINUTE = 60_000;
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

type GoogleUser = { sub: string; email: string };
let googleUser: GoogleUser | null = null;

function unsignedJwt(claims: object) {
	const encode = (part: object) =>
		Buffer.from(JSON.stringify(part)).toString("base64url");
	return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ["Date"] });
	vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
		const url = input instanceof Request ? input.url : String(input);
		if (url !== GOOGLE_TOKEN_URL || !googleUser)
			throw new Error(`Unexpected fetch: ${url}`);
		return Response.json({
			access_token: "dummy",
			token_type: "Bearer",
			expires_in: 3600,
			id_token: unsignedJwt({
				...googleUser,
				email_verified: true,
				name: "Utente Test",
			}),
		});
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	googleUser = null;
});

afterAll(() => closeTestDb());

type Client = ReturnType<typeof authClient>;

async function signIn(client: Client, email: string) {
	const response = await client.post("/sign-in/email", {
		email,
		password: TEST_PASSWORD,
	});
	expect(response.status).toBe(200);
}

/** Starts a Google flow at `path` and returns from Google as `user`. */
async function throughGoogle(
	client: Client,
	path: "/link-social" | "/sign-in/social",
	user: GoogleUser
) {
	googleUser = user;
	const started = await client.post(path, { provider: "google", callbackURL: "/" });
	expect(started.status).toBe(200);
	const { url } = (await started.json()) as { url: string };
	const state = new URL(url).searchParams.get("state");
	return client.get(`/callback/google?state=${state}&code=test-code`);
}

function runMiddleware(
	middleware: typeof authMiddleware | typeof optionalAuthMiddleware,
	headers: Headers
) {
	request.headers = headers;
	return middleware.options.server!({
		next: async (result: unknown) => result,
	} as never);
}

function googleAccounts(tx: TestTx, userId: string) {
	return tx
		.select()
		.from(accounts)
		.where(and(eq(accounts.userId, userId), eq(accounts.providerId, "google")));
}

function sessionsOf(tx: TestTx, userId: string) {
	return tx.select().from(sessions).where(eq(sessions.userId, userId));
}

describe("an anonymized account", () => {
	it("is signed out of the app while its cookie cache lasts", () =>
		withBoundRollback(async tx => {
			const start = Date.now();
			const user = await createPasswordUser(tx);
			const client = authClient();
			await signIn(client, user.email);
			expect(await runMiddleware(authMiddleware, client.headers())).toMatchObject({
				context: { user: { id: user.id } },
			});

			await anonymizeUser(tx, user.id);
			vi.setSystemTime(start + MINUTE);

			expect(
				await getAuth().api.getSession({ headers: client.headers() })
			).not.toBeNull();
			await expect(
				runMiddleware(authMiddleware, client.headers())
			).rejects.toBeInstanceOf(Unauthorized);
			expect(
				await runMiddleware(optionalAuthMiddleware, client.headers())
			).toMatchObject({ context: { user: null } });
			expect(await getSession()).toBeNull();
		}));

	it("cannot link a Google account while its cookie cache lasts", () =>
		withBoundRollback(async tx => {
			const start = Date.now();
			const live = await createPasswordUser(tx);
			const gone = await createPasswordUser(tx);
			const liveClient = authClient();
			const goneClient = authClient();
			await signIn(liveClient, live.email);
			await signIn(goneClient, gone.email);

			await anonymizeUser(tx, gone.id);
			vi.setSystemTime(start + MINUTE);

			await throughGoogle(liveClient, "/link-social", {
				sub: `g-${live.id}`,
				email: live.email,
			});
			await throughGoogle(goneClient, "/link-social", {
				sub: `g-${gone.id}`,
				email: gone.email,
			});

			expect(await googleAccounts(tx, live.id)).toHaveLength(1);
			expect(await googleAccounts(tx, gone.id)).toHaveLength(0);
		}));

	it("cannot sign in through a Google account still bound to it", () =>
		withBoundRollback(async tx => {
			const live = await createPasswordUser(tx);
			const gone = await createPasswordUser(tx);
			await anonymizeUser(tx, gone.id);
			await tx.insert(accounts).values([
				{ userId: live.id, providerId: "google", accountId: `g-${live.id}` },
				{ userId: gone.id, providerId: "google", accountId: `g-${gone.id}` },
			]);

			await throughGoogle(authClient(), "/sign-in/social", {
				sub: `g-${live.id}`,
				email: live.email,
			});
			await throughGoogle(authClient(), "/sign-in/social", {
				sub: `g-${gone.id}`,
				email: gone.email,
			});

			expect(await sessionsOf(tx, live.id)).toHaveLength(1);
			expect(await sessionsOf(tx, gone.id)).toHaveLength(0);
		}));
});
