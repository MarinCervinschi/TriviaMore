import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { profiles, users } from "@/db/schema";
import { authClient, setAuthEnv } from "@/lib/testing/auth";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";

import { getAuth } from "./server";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/email/server", () => ({ sendMail: async () => {} }));

setAuthEnv();
process.env.GOOGLE_CLIENT_ID = "dummy";
process.env.GOOGLE_CLIENT_SECRET = "dummy";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FOREIGN_IMAGE = "https://images.example.invalid/p.png";
const GOOGLE_IMAGE = "https://lh3.googleusercontent.com/a/test";

let googleEmail = "";

function unsignedJwt(claims: object) {
	const encode = (part: object) =>
		Buffer.from(JSON.stringify(part)).toString("base64url");
	return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

beforeEach(() => {
	vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
		const url = input instanceof Request ? input.url : String(input);
		if (url !== GOOGLE_TOKEN_URL) throw new Error(`Unexpected fetch: ${url}`);
		return Response.json({
			access_token: "dummy",
			token_type: "Bearer",
			expires_in: 3600,
			id_token: unsignedJwt({
				sub: `g-${googleEmail}`,
				email: googleEmail,
				email_verified: true,
				name: "Utente Google",
				picture: GOOGLE_IMAGE,
			}),
		});
	});
});

afterEach(() => vi.unstubAllGlobals());

afterAll(() => closeTestDb());

function newAddress() {
	return `${crypto.randomUUID()}@example.test`;
}

async function profileOf(tx: TestTx, email: string) {
	const [row] = await tx
		.select({ image: profiles.image })
		.from(profiles)
		.innerJoin(users, eq(users.id, profiles.id))
		.where(eq(users.email, email));
	return row;
}

describe("the Better Auth sign-up route", () => {
	it("is not served", () =>
		withBoundRollback(async tx => {
			const email = newAddress();
			const client = authClient();

			const signUp = await client.post("/sign-up/email", {
				name: "x".repeat(500),
				email,
				password: "Dummy1234",
				image: FOREIGN_IMAGE,
			});
			expect(signUp.status).toBe(404);
			expect(await profileOf(tx, email)).toBeUndefined();

			expect((await client.get("/verify-email?token=x")).status).toBe(404);
			expect((await client.post("/send-verification-email", { email })).status).toBe(
				404
			);
		}));
});

describe("a new profile", () => {
	it("keeps no image from a password sign-up", () =>
		withBoundRollback(async tx => {
			const email = newAddress();
			await getAuth().api.signUpEmail({
				body: {
					name: "Utente Test",
					email,
					password: "Dummy1234",
					image: FOREIGN_IMAGE,
				},
			});
			expect(await profileOf(tx, email)).toEqual({ image: null });
		}));

	it("keeps the image of an OAuth sign-up", () =>
		withBoundRollback(async tx => {
			googleEmail = newAddress();
			const client = authClient();
			const started = await client.post("/sign-in/social", {
				provider: "google",
				callbackURL: "/",
			});
			const { url } = (await started.json()) as { url: string };
			const state = new URL(url).searchParams.get("state");
			await client.get(`/callback/google?state=${state}&code=test-code`);

			expect(await profileOf(tx, googleEmail)).toEqual({ image: GOOGLE_IMAGE });
		}));
});
