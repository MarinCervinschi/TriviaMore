import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";
import { randomBytes } from "node:crypto";

import { getDb } from "@/db";
import { insertLegalAcceptances } from "@/lib/legal/service";
import { log } from "@/lib/logging/server";
import { emailKey, rateLimiter, requestIp } from "@/lib/server/rate-limits";

import { findProfile } from "./db/profiles";
import { getAuthUser, toAuthUser } from "./guards";
import type { LoginInput, OAuthProvider, RegisterInput } from "./schemas";
import { getAuth, sendPasswordLink } from "./server";
import type { AuthResult, AuthSession, SignupResult } from "./types";

const ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "Email o password non corrette",
	EMAIL_NOT_VERIFIED:
		"Devi prima confermare la tua email. Ti abbiamo inviato un link per confermarla e scegliere la password.",
	INVALID_TOKEN: "Il link è scaduto o è già stato usato",
	EMAIL_PASSWORD_SIGN_UP_DISABLED: "La registrazione con email e password non è attiva",
	PASSWORD_TOO_SHORT: "La password è troppo corta",
	PASSWORD_TOO_LONG: "La password è troppo lunga",
};

const TOO_MANY_SIGN_INS = "Troppi tentativi di accesso. Riprova più tardi.";
const TOO_MANY_LINKS = "Troppe richieste di link. Riprova più tardi.";

function errorCode(error: unknown): string {
	return error instanceof APIError && typeof error.body?.code === "string"
		? error.body.code
		: "";
}

function errorMessage(error: unknown, fallback: string): string {
	return ERROR_MESSAGES[errorCode(error)] ?? fallback;
}

function limitKeys(email: string) {
	return { email: emailKey(email), ip: requestIp() };
}

/** Counts the request even when no link goes out, so every address gets the same answer. */
function allowAuthMail(email: string) {
	return rateLimiter().checkAndReport("auth-mail", limitKeys(email));
}

/** A password nobody knows, replaced when the owner chooses one from the mailed link. */
function unusablePassword() {
	return randomBytes(32).toString("base64url");
}

export async function getSession(): Promise<AuthSession | null> {
	const user = await getAuthUser();
	return user ? { user } : null;
}

export async function login(input: LoginInput): Promise<AuthResult> {
	const keys = limitKeys(input.email);
	if (!(await rateLimiter().check("login-fail", keys))) {
		return { success: false, error: TOO_MANY_SIGN_INS };
	}

	let userId: string;
	try {
		const result = await getAuth().api.signInEmail({
			body: { email: input.email, password: input.password },
			headers: getRequestHeaders(),
		});
		userId = result.user.id;
	} catch (error) {
		const code = errorCode(error);
		if (code === "INVALID_EMAIL_OR_PASSWORD")
			await rateLimiter().report("login-fail", keys);
		if (code === "EMAIL_NOT_VERIFIED" && (await allowAuthMail(input.email))) {
			await sendPasswordLink(input.email);
		}
		return { success: false, error: errorMessage(error, "Accesso non riuscito") };
	}

	const profile = await findProfile(getDb(), userId);
	if (!profile) return { success: false, error: "Profilo utente non trovato" };

	return { success: true, user: toAuthUser(profile) };
}

export async function signup(input: RegisterInput): Promise<SignupResult> {
	if (!(await allowAuthMail(input.email)))
		return { success: false, error: TOO_MANY_LINKS };

	let userId: string;
	try {
		const result = await getAuth().api.signUpEmail({
			body: {
				name: input.name,
				email: input.email,
				password: unusablePassword(),
			},
			headers: getRequestHeaders(),
		});
		userId = result.user.id;
	} catch (error) {
		return { success: false, error: errorMessage(error, "Registrazione non riuscita") };
	}

	// An address already registered gets a made-up user with no profile, so nobody learns it exists.
	if (await findProfile(getDb(), userId)) {
		await insertLegalAcceptances(userId);
		await sendPasswordLink(input.email);
	}

	return { success: true, status: "pending_email_confirmation", email: input.email };
}

export async function socialSignInUrl(provider: OAuthProvider) {
	try {
		const result = await getAuth().api.signInSocial({
			body: {
				provider,
				callbackURL: "/",
				newUserCallbackURL: "/onboarding",
				errorCallbackURL: "/auth/auth-code-error",
				disableRedirect: true,
			},
			headers: getRequestHeaders(),
		});
		if (!result.url)
			return { success: false as const, error: "Accesso non disponibile" };
		return { success: true as const, url: result.url };
	} catch (error) {
		return {
			success: false as const,
			error: errorMessage(error, "Accesso non disponibile"),
		};
	}
}

export async function logout() {
	try {
		await getAuth().api.signOut({ headers: getRequestHeaders() });
		return { success: true };
	} catch {
		return { success: false };
	}
}

/** Answers the same for every address, so it does not tell whether one has an account. */
export async function resendConfirmation(email: string) {
	if (!(await allowAuthMail(email)))
		return { success: false as const, error: TOO_MANY_LINKS };
	const { internalAdapter } = await getAuth().$context;
	const found = await internalAdapter.findUserByEmail(email);
	if (found && !found.user.emailVerified) await sendPasswordLink(email);
	return { success: true as const };
}

/** Answers the same for every address, so it does not tell whether one has an account. */
export async function requestPasswordReset(email: string) {
	if (!(await allowAuthMail(email)))
		return { success: false as const, error: TOO_MANY_LINKS };
	try {
		await sendPasswordLink(email);
	} catch (error) {
		log.error("Password link not requested", {}, error);
	}
	return { success: true as const };
}

/** The user a reset token belongs to, read before the reset spends the token. */
async function findTokenOwner(token: string) {
	const { internalAdapter } = await getAuth().$context;
	const verification = await internalAdapter.findVerificationValue(
		`reset-password:${token}`
	);
	if (!verification) return null;
	return internalAdapter.findUserById(verification.value);
}

async function signInWithNewPassword(email: string, password: string) {
	try {
		await getAuth().api.signInEmail({
			body: { email, password },
			headers: getRequestHeaders(),
		});
		return true;
	} catch {
		return false;
	}
}

/** Sets the password from a mailed link and signs its owner in; `newAccount` means the link confirmed the address. */
export async function resetPassword(input: { token: string; password: string }) {
	const owner = await findTokenOwner(input.token);
	try {
		await getAuth().api.resetPassword({
			body: { token: input.token, newPassword: input.password },
			headers: getRequestHeaders(),
		});
	} catch (error) {
		return {
			success: false as const,
			error: errorMessage(error, "Impossibile cambiare la password"),
		};
	}
	if (!owner) return { success: true as const, signedIn: false, newAccount: false };
	return {
		success: true as const,
		signedIn: await signInWithNewPassword(owner.email, input.password),
		newAccount: !owner.emailVerified,
	};
}
