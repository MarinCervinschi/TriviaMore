import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TEST_PASSWORD, createPasswordUser, setAuthEnv } from "@/lib/testing/auth";
import { closeTestDb, withBoundRollback } from "@/lib/testing/db";

import { registerSchema } from "./schemas";
import { login, requestPasswordReset, resendConfirmation, signup } from "./service";

const request = vi.hoisted(() => ({ ip: "" }));
const mail = vi.hoisted(() => ({ sent: [] as string[] }));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/email/server", () => ({
	sendMail: async (message: { to: string }) => {
		mail.sent.push(message.to);
	},
}));

vi.mock("@tanstack/react-start/server", async importOriginal => ({
	...(await importOriginal<typeof import("@tanstack/react-start/server")>()),
	getRequestHeaders: () => new Headers({ "cf-connecting-ip": request.ip }),
}));

setAuthEnv();
vi.stubEnv("CLIENT_IP_HEADER", undefined);
vi.stubEnv("LIMITADOR_URL", undefined);

const TOO_MANY_SIGN_INS = {
	success: false,
	error: "Troppi tentativi di accesso. Riprova più tardi.",
};
const TOO_MANY_LINKS = {
	success: false,
	error: "Troppe richieste di link. Riprova più tardi.",
};

let lastOctet = 0;

beforeEach(() => {
	lastOctet += 1;
	request.ip = `198.51.100.${lastOctet}`;
	mail.sent.length = 0;
});

afterAll(() => closeTestDb());

function newAddress() {
	return `${crypto.randomUUID()}@example.test`;
}

function mailsTo(email: string) {
	return mail.sent.filter(to => to === email).length;
}

describe("a password sign-in", () => {
	it("is refused after five wrong passwords, the right one included", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			for (let attempt = 0; attempt < 5; attempt++) {
				expect(await login({ email: user.email, password: "Sbagliata1" })).toEqual({
					success: false,
					error: "Email o password non corrette",
				});
			}

			expect(await login({ email: user.email, password: TEST_PASSWORD })).toEqual(
				TOO_MANY_SIGN_INS
			);
		}));

	it("counts nothing when the password is right", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			for (let attempt = 0; attempt < 6; attempt++) {
				expect(
					await login({ email: user.email, password: TEST_PASSWORD })
				).toMatchObject({
					success: true,
				});
			}
		}));

	it("answers an address without an account the same way", () =>
		withBoundRollback(async () => {
			const email = newAddress();
			for (let attempt = 0; attempt < 5; attempt++) {
				await login({ email, password: "Sbagliata1" });
			}

			expect(await login({ email, password: "Sbagliata1" })).toEqual(TOO_MANY_SIGN_INS);
		}));

	it("counts an address in any letter case as one", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			for (let attempt = 0; attempt < 5; attempt++) {
				const email = attempt % 2 ? user.email.toUpperCase() : user.email;
				await login({ email, password: "Sbagliata1" });
			}

			expect(await login({ email: user.email, password: TEST_PASSWORD })).toEqual(
				TOO_MANY_SIGN_INS
			);
		}));

	it("is refused from an IP after twenty wrong passwords on any addresses", () =>
		withBoundRollback(async tx => {
			for (let attempt = 0; attempt < 20; attempt++) {
				await login({ email: newAddress(), password: "Sbagliata1" });
			}
			const user = await createPasswordUser(tx);

			expect(await login({ email: user.email, password: TEST_PASSWORD })).toEqual(
				TOO_MANY_SIGN_INS
			);
			request.ip = "198.51.100.250";
			expect(await login({ email: user.email, password: TEST_PASSWORD })).toMatchObject(
				{
					success: true,
				}
			);
		}));
});

describe("a request for a link", () => {
	it("answers the same for an address with and without an account", () =>
		withBoundRollback(async tx => {
			const user = await createPasswordUser(tx);
			const unknown = newAddress();

			for (const email of [user.email, unknown]) {
				for (let attempt = 0; attempt < 3; attempt++) {
					expect(await requestPasswordReset(email)).toEqual({ success: true });
				}
				expect(await requestPasswordReset(email)).toEqual(TOO_MANY_LINKS);
			}

			expect(mailsTo(user.email)).toBe(3);
			expect(mailsTo(unknown)).toBe(0);
		}));

	it("shares one count across sign-up, resend and reset", () =>
		withBoundRollback(async () => {
			const email = newAddress();
			await signup(
				registerSchema.parse({
					name: "Utente Nuovo",
					email,
					terms_accepted: true,
					privacy_accepted: true,
				})
			);
			await resendConfirmation(email);
			await requestPasswordReset(email);

			expect(await resendConfirmation(email)).toEqual(TOO_MANY_LINKS);
			expect(mailsTo(email)).toBe(3);
		}));

	it("is refused from an IP after ten requests on any addresses", () =>
		withBoundRollback(async () => {
			for (let attempt = 0; attempt < 10; attempt++) {
				expect(await requestPasswordReset(newAddress())).toEqual({ success: true });
			}

			expect(await requestPasswordReset(newAddress())).toEqual(TOO_MANY_LINKS);
		}));
});
