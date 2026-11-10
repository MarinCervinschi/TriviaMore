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
import { clientIpHeader } from "@/lib/server/client-ip";

import { findProfile } from "./db/profiles";
import { hashPassword, isAllowedEmail, verifyPassword } from "./rules";

const LINK_EXPIRES_IN_SECONDS = 60 * 60;
const SESSION_CACHE_SECONDS = 5 * 60;
const PASSWORD_PAGE = "/auth/reset-password";
const OAUTH_SIGN_UP_PATHS = new Set(["/callback/:id", "/sign-in/social"]);

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

/** The same link, landing on the sign-up variant of the password page. */
function signupLink(url: string) {
	const link = new URL(url);
	link.searchParams.set("callbackURL", `${PASSWORD_PAGE}?from=signup`);
	return link.href;
}

/** Mails a link to choose the password; the address is confirmed once it is used. */
export async function sendPasswordLink(email: string) {
	await getAuth().api.requestPasswordReset({
		body: { email, redirectTo: PASSWORD_PAGE },
	});
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

async function isAnonymized(userId: string) {
	const profile = await findProfile(getDb(), userId);
	return !!profile?.anonymizedAt;
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
			ipAddress: { ipAddressHeaders: [clientIpHeader()] },
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
			sendResetPassword: async ({ user, url }) => {
				if (user.emailVerified) sendAuthLink(user.email, "reset-password", url);
				else sendAuthLink(user.email, "set-password", signupLink(url));
			},
			onPasswordReset: async ({ user }) => {
				if (user.emailVerified) return;
				const context = await getAuth().$context;
				await context.internalAdapter.updateUser(user.id, { emailVerified: true });
			},
			onExistingUserSignUp: async ({ user }) => {
				if (!user.emailVerified) await sendPasswordLink(user.email);
			},
		},
		emailVerification: {
			sendOnSignUp: false,
			sendOnSignIn: false,
			autoSignInAfterVerification: false,
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
					after: async (user, context) => {
						const oauth = OAUTH_SIGN_UP_PATHS.has(context?.path ?? "");
						await getDb()
							.insert(profiles)
							.values({
								id: user.id,
								name: user.name || null,
								email: user.email,
								image: oauth ? (user.image ?? null) : null,
							})
							.onConflictDoNothing();
					},
				},
			},
			session: {
				create: { before: async session => !(await isAnonymized(session.userId)) },
			},
			account: {
				create: { before: async account => !(await isAnonymized(account.userId)) },
			},
		},
		// A server function or the password link does each of these instead.
		disabledPaths: [
			"/update-user",
			"/sign-up/email",
			"/verify-email",
			"/send-verification-email",
		],
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
