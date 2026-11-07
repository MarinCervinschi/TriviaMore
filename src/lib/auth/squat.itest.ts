import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { sessions, users } from "@/db/schema";
import {
	AUTH_ORIGIN,
	TEST_PASSWORD,
	authClient,
	createPasswordUser,
	setAuthEnv,
} from "@/lib/testing/auth";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";

import { registerSchema } from "./schemas";
import { getAuth } from "./server";
import {
	login,
	requestPasswordReset,
	resendConfirmation,
	resetPassword,
	signup,
} from "./service";

const mail = vi.hoisted(() => ({
	sent: [] as { to: string; subject: string; text: string }[],
}));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/email/server", () => ({
	sendMail: async (message: { to: string; subject: string; text: string }) => {
		mail.sent.push(message);
	},
}));

vi.mock("@tanstack/react-start/server", async importOriginal => ({
	...(await importOriginal<typeof import("@tanstack/react-start/server")>()),
	getRequestHeaders: () => new Headers(),
}));

setAuthEnv();

const SQUATTER_PASSWORD = "Squat1234";
const OWNER_PASSWORD = "Owner1234";

beforeEach(() => {
	mail.sent.length = 0;
});

afterAll(() => closeTestDb());

function newAddress() {
	return `${crypto.randomUUID()}@example.test`;
}

function registration(email: string, name: string, password: string) {
	return registerSchema.parse({
		name,
		email,
		password,
		password_confirm: password,
		terms_accepted: true,
		privacy_accepted: true,
	});
}

function mailsTo(email: string) {
	return mail.sent.filter(message => message.to === email);
}

function lastLinkTo(email: string) {
	const last = mailsTo(email).at(-1);
	const link = last?.text.match(/https?:\/\/\S+/)?.[0];
	if (!link) throw new Error(`No link mailed to ${email}`);
	return link;
}

/** Opens a mailed link as a browser would and returns the app page it lands on. */
async function openLink(link: string) {
	const { pathname, search } = new URL(link);
	const response = await authClient().get(pathname.replace("/api/auth", "") + search);
	return new URL(response.headers.get("location") ?? "/", AUTH_ORIGIN);
}

async function findUser(tx: TestTx, email: string) {
	const [user] = await tx.select().from(users).where(eq(users.email, email));
	return user;
}

function sessionTokensOf(tx: TestTx, userId: string) {
	return tx
		.select({ token: sessions.token })
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.then(rows => rows.map(row => row.token));
}

describe("an address registered by someone else", () => {
	it("belongs to whoever chooses the password from the inbox", () =>
		withBoundRollback(async () => {
			const owner = newAddress();
			await signup(registration(owner, "Ospite Abusivo", SQUATTER_PASSWORD));

			const landing = await openLink(lastLinkTo(owner));
			const token = landing.searchParams.get("token");
			if (token) await resetPassword({ token, password: OWNER_PASSWORD });

			const squatter = authClient();
			const attempt = await squatter.post("/sign-in/email", {
				email: owner,
				password: SQUATTER_PASSWORD,
			});
			expect(attempt.status).not.toBe(200);
			expect(
				await getAuth().api.getSession({ headers: squatter.headers() })
			).toBeNull();

			const ownerSignIn = await authClient().post("/sign-in/email", {
				email: owner,
				password: OWNER_PASSWORD,
			});
			expect(ownerSignIn.status).toBe(200);
		}));
});

describe("the set-password link", () => {
	it("confirms the address and signs the new user in", () =>
		withBoundRollback(async tx => {
			const email = newAddress();
			const result = await signup(registration(email, "Utente Nuovo", OWNER_PASSWORD));
			expect(result).toMatchObject({ success: true });
			expect(mailsTo(email)).toHaveLength(1);

			const landing = await openLink(lastLinkTo(email));
			expect(landing.pathname).toBe("/auth/reset-password");
			expect(landing.searchParams.get("from")).toBe("signup");
			expect(landing.search).not.toContain(encodeURIComponent(email));

			const reset = await resetPassword({
				token: landing.searchParams.get("token") ?? "",
				password: OWNER_PASSWORD,
			});
			expect(reset).toMatchObject({ success: true, signedIn: true, newAccount: true });

			const user = await findUser(tx, email);
			expect(user.emailVerified).toBe(true);
			expect(await sessionTokensOf(tx, user.id)).toHaveLength(1);
		}));

	it("signs in a user who reset a forgotten password", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			await authClient().post("/sign-in/email", {
				email: user.email,
				password: TEST_PASSWORD,
			});
			const [before] = await sessionTokensOf(tx, user.id);
			await requestPasswordReset(user.email);

			const landing = await openLink(lastLinkTo(user.email));
			expect(landing.searchParams.has("from")).toBe(false);
			const reset = await resetPassword({
				token: landing.searchParams.get("token") ?? "",
				password: OWNER_PASSWORD,
			});
			expect(reset).toMatchObject({ success: true, signedIn: true, newAccount: false });

			const after = await sessionTokensOf(tx, user.id);
			expect(after).toHaveLength(1);
			expect(after).not.toContain(before);
		}));
});

describe("a request for a new link", () => {
	it("mails an unverified address on resend, repeat sign-up and sign-in", () =>
		withBoundRollback(async tx => {
			const email = newAddress();
			await signup(registration(email, "Utente Nuovo", OWNER_PASSWORD));

			await resendConfirmation(email);
			await signup(registration(email, "Utente Nuovo", OWNER_PASSWORD));
			expect(mailsTo(email)).toHaveLength(3);

			const legacy = await createPasswordUser(tx);
			await tx
				.update(users)
				.set({ emailVerified: false })
				.where(eq(users.id, legacy.id));
			const attempt = await login({ email: legacy.email, password: TEST_PASSWORD });
			expect(attempt).toMatchObject({ success: false });
			expect(mailsTo(legacy.email)).toHaveLength(1);
			const landing = await openLink(lastLinkTo(legacy.email));
			expect(landing.searchParams.get("from")).toBe("signup");
		}));

	it("mails nothing to a verified address", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			await signup(registration(user.email, "Ospite Abusivo", SQUATTER_PASSWORD));
			await resendConfirmation(user.email);
			expect(mailsTo(user.email)).toHaveLength(0);
		}));
});
