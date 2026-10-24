import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "@/db";
import { accounts, profiles, sessions, users, verifications } from "@/db/schema";
import { sendMail } from "@/lib/email/server";
import {
	type AuthLinkPurpose,
	renderAuthLinkEmail,
} from "@/lib/email/templates/auth-link";
import { log } from "@/lib/logging/server";

import { hashPassword, isAllowedEmail, verifyPassword } from "./rules";

const LINK_EXPIRES_IN_SECONDS = 60 * 60;
const SESSION_CACHE_SECONDS = 5 * 60;

function sendAuthLink(to: string, purpose: AuthLinkPurpose, url: string) {
	const email = renderAuthLinkEmail({
		purpose,
		url,
		expiresInMinutes: LINK_EXPIRES_IN_SECONDS / 60,
	});
	// Not awaited, so the response time does not tell whether the address exists.
	void sendMail({ to, ...email }).catch(error =>
		log.error("Auth email {Purpose} not sent", { Purpose: purpose }, error)
	);
}

function socialProviders() {
	const providers: Record<string, { clientId: string; clientSecret: string }> = {};
	if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		};
	}
	if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
		providers.github = {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		};
	}
	return providers;
}

function createAuth() {
	const allowedDomain = process.env.AUTH_ALLOWED_EMAIL_DOMAIN?.trim() || undefined;

	return betterAuth({
		baseURL: process.env.BETTER_AUTH_URL,
		secret: process.env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(), {
			provider: "pg",
			schema: {
				user: users,
				session: sessions,
				account: accounts,
				verification: verifications,
			},
		}),
		advanced: {
			database: { generateId: "uuid" },
			ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
		},
		emailAndPassword: {
			enabled: true,
			disableSignUp: !!allowedDomain,
			requireEmailVerification: true,
			minPasswordLength: 6,
			maxPasswordLength: 100,
			resetPasswordTokenExpiresIn: LINK_EXPIRES_IN_SECONDS,
			revokeSessionsOnPasswordReset: true,
			password: { hash: hashPassword, verify: verifyPassword },
			sendResetPassword: async ({ user, url }) =>
				sendAuthLink(user.email, "reset-password", url),
		},
		emailVerification: {
			sendOnSignUp: true,
			sendOnSignIn: true,
			autoSignInAfterVerification: true,
			expiresIn: LINK_EXPIRES_IN_SECONDS,
			sendVerificationEmail: async ({ user, url }) =>
				sendAuthLink(user.email, "verify-email", url),
		},
		socialProviders: socialProviders(),
		session: {
			cookieCache: { enabled: true, maxAge: SESSION_CACHE_SECONDS },
		},
		user: {
			validateUserInfo: ({ user }) => {
				if (!allowedDomain) return;
				if (
					user.emailVerified === false ||
					!isAllowedEmail(user.email, allowedDomain)
				) {
					return {
						error: "email_not_allowed",
						errorDescription: `Accesso riservato agli indirizzi @${allowedDomain}`,
					};
				}
			},
		},
		databaseHooks: {
			user: {
				create: {
					after: async user => {
						await getDb()
							.insert(profiles)
							.values({
								id: user.id,
								name: user.name || null,
								email: user.email,
								image: user.image ?? null,
							})
							.onConflictDoNothing();
					},
				},
			},
		},
		plugins: [tanstackStartCookies()],
	});
}

let _auth: ReturnType<typeof createAuth> | null = null;

/** The Better Auth instance, built on first use so the secrets are loaded by then. */
export function getAuth() {
	if (!_auth) _auth = createAuth();
	return _auth;
}

/** The session of the current request, or null; reads the cookie cache before the database. */
export function readSession() {
	return getAuth().api.getSession({ headers: getRequestHeaders() });
}
