import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";

import { getDb } from "@/db";
import { insertLegalAcceptances } from "@/lib/legal/service";

import { findProfile } from "./db/profiles";
import { toAuthUser } from "./guards";
import type { LoginInput, OAuthProvider, RegisterInput } from "./schemas";
import { getAuth, readSession } from "./server";
import type { AuthResult, AuthSession, SignupResult } from "./types";

const ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "Email o password non corrette",
	EMAIL_NOT_VERIFIED:
		"Devi prima confermare la tua email. Ti abbiamo inviato un nuovo link di conferma.",
	INVALID_TOKEN: "Il link è scaduto o è già stato usato",
	EMAIL_PASSWORD_SIGN_UP_DISABLED: "La registrazione con email e password non è attiva",
	PASSWORD_TOO_SHORT: "La password è troppo corta",
	PASSWORD_TOO_LONG: "La password è troppo lunga",
};

function errorMessage(error: unknown, fallback: string): string {
	if (error instanceof APIError) {
		const code = typeof error.body?.code === "string" ? error.body.code : "";
		if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
		if (error.status === "TOO_MANY_REQUESTS")
			return "Troppi tentativi. Riprova tra poco.";
	}
	return fallback;
}

/** Where the verification link lands; `from` tells a sign-in from a sign-up. */
function confirmUrl(from: "signup" | "login") {
	return `/auth/confirm?from=${from}`;
}

export async function getSession(): Promise<AuthSession | null> {
	const session = await readSession();
	if (!session) return null;

	const profile = await findProfile(getDb(), session.user.id);
	if (!profile) return null;

	return { user: toAuthUser(profile) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
	let userId: string;
	try {
		const result = await getAuth().api.signInEmail({
			body: {
				email: input.email,
				password: input.password,
				callbackURL: confirmUrl("login"),
			},
			headers: getRequestHeaders(),
		});
		userId = result.user.id;
	} catch (error) {
		return { success: false, error: errorMessage(error, "Accesso non riuscito") };
	}

	const profile = await findProfile(getDb(), userId);
	if (!profile) return { success: false, error: "Profilo utente non trovato" };

	return { success: true, user: toAuthUser(profile) };
}

export async function signup(input: RegisterInput): Promise<SignupResult> {
	let userId: string;
	try {
		const result = await getAuth().api.signUpEmail({
			body: {
				name: input.name,
				email: input.email,
				password: input.password,
				callbackURL: confirmUrl("signup"),
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

export async function resendConfirmation(email: string) {
	try {
		await getAuth().api.sendVerificationEmail({
			body: { email, callbackURL: confirmUrl("signup") },
			headers: getRequestHeaders(),
		});
		return { success: true as const };
	} catch (error) {
		return {
			success: false as const,
			error: errorMessage(error, "Impossibile inviare l'email"),
		};
	}
}

/** Always succeeds, so the answer does not tell whether the address has an account. */
export async function requestPasswordReset(email: string) {
	try {
		await getAuth().api.requestPasswordReset({
			body: { email, redirectTo: "/auth/reset-password" },
			headers: getRequestHeaders(),
		});
	} catch (error) {
		if (error instanceof APIError && error.status === "TOO_MANY_REQUESTS") {
			return { success: false as const, error: errorMessage(error, "") };
		}
	}
	return { success: true as const };
}

export async function resetPassword(input: { token: string; password: string }) {
	try {
		await getAuth().api.resetPassword({
			body: { token: input.token, newPassword: input.password },
			headers: getRequestHeaders(),
		});
		return { success: true as const };
	} catch (error) {
		return {
			success: false as const,
			error: errorMessage(error, "Impossibile cambiare la password"),
		};
	}
}
