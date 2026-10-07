import type { LoginInput } from "@/lib/auth/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { ConsoleSession, LoginResult } from "./types";

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

export async function logout(): Promise<void> {
	await createServerSupabaseClient().auth.signOut();
}

/** For every endpoint that reads or writes data: the page guard alone does not stop a direct call. */
export async function requireOwner(): Promise<ConsoleSession> {
	const session = await getConsoleSession();
	if (!session) throw new Error("Accesso riservato al proprietario della console.");
	return session;
}
