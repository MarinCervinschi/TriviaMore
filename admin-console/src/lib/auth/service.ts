import { getRequestUrl } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

import { profiles } from "@/db/schema";
import type { LoginInput } from "@/lib/auth/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { consoleDb } from "~/lib/db/client";

import type {
	ConsoleAccount,
	ConsoleSession,
	GoogleSignInResult,
	LoginResult,
	OAuthFailure,
} from "./types";

const NOT_OWNER = "Questo account non può accedere alla console.";

function ownerIds(): Set<string> {
	return new Set(
		(process.env.CONSOLE_OWNER_IDS ?? "")
			.split(",")
			.map(id => id.trim())
			.filter(Boolean)
	);
}

/** The signed-in owner, or null for anyone else, signed in or not. */
export async function getConsoleSession(): Promise<ConsoleSession | null> {
	const {
		data: { user },
		error,
	} = await createServerSupabaseClient().auth.getUser();
	if (error || !user || !ownerIds().has(user.id)) return null;
	return { userId: user.id, email: user.email ?? null };
}

/** The owner with their profile, read from the console database; a missing or unreachable profile still signs them in. */
export async function getConsoleAccount(): Promise<ConsoleAccount | null> {
	const session = await getConsoleSession();
	if (!session) return null;
	let profile: { name: string | null; image: string | null } | undefined;
	try {
		[profile] = await consoleDb()
			.select({ name: profiles.name, image: profiles.image })
			.from(profiles)
			.where(eq(profiles.id, session.userId));
	} catch {
		profile = undefined;
	}
	return { ...session, name: profile?.name ?? null, image: profile?.image ?? null };
}

export async function login(input: LoginInput): Promise<LoginResult> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase.auth.signInWithPassword(input);
	if (error) return { success: false, error: "Email o password non corrette." };

	// A valid TriviaMore account is not enough: the session is dropped before it reaches the console.
	if (!ownerIds().has(data.user.id)) {
		await supabase.auth.signOut();
		return { success: false, error: NOT_OWNER };
	}
	return { success: true };
}

/** Where Google sends the owner back: this console's own origin, so it works the same locally and on the tailnet. */
export async function googleSignInUrl(): Promise<GoogleSignInResult> {
	const { origin } = getRequestUrl();
	const { data, error } = await createServerSupabaseClient().auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo: `${origin}/auth/callback` },
	});
	if (error || !data.url)
		return { success: false, error: "Accesso con Google non disponibile." };
	return { success: true, url: data.url };
}

/** Finishes a Google sign-in; an account that is not the owner's is signed out before it reaches the console. */
export async function completeOAuth(code: string): Promise<OAuthFailure | null> {
	const supabase = createServerSupabaseClient();
	const { data, error } = await supabase.auth.exchangeCodeForSession(code);
	if (error || !data.user) return "failed";
	if (!ownerIds().has(data.user.id)) {
		await supabase.auth.signOut();
		return "not-owner";
	}
	return null;
}

export async function logout(): Promise<void> {
	await createServerSupabaseClient().auth.signOut();
}

/** For every endpoint that reads or writes data: the page guard alone does not stop a direct call. */
export async function requireOwner(): Promise<ConsoleSession> {
	const session = await getConsoleSession();
	if (!session) throw new Error("Accesso riservato al proprietario della console.");
	return session;
}
