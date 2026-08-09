import { getDb } from "@/db";
import { insertLegalAcceptances } from "@/lib/legal/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { findProfile } from "./db/profiles";
import { toAuthUser } from "./guards";
import type { LoginInput, RegisterInput } from "./schemas";
import type { AuthResult, AuthSession, SignupResult } from "./types";

export async function getSession(): Promise<AuthSession | null> {
	const supabase = createServerSupabaseClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error || !user) return null;

	const profile = await findProfile(getDb(), user.id);
	if (!profile) return null;

	const session = await supabase.auth.getSession();

	return {
		user: toAuthUser(profile),
		supabaseSession: session.data.session!,
	};
}

export async function login(input: LoginInput): Promise<AuthResult> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email: input.email,
		password: input.password,
	});
	if (error) return { success: false, error: error.message };

	const profile = await findProfile(getDb(), data.user.id);
	if (!profile) return { success: false, error: "Profilo utente non trovato" };

	return { success: true, user: toAuthUser(profile) };
}

export async function signup(input: RegisterInput): Promise<SignupResult> {
	const supabase = createServerSupabaseClient();

	const { data, error } = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: { data: { name: input.name } },
	});
	if (error) return { success: false, error: error.message };
	if (!data.user) return { success: false, error: "Registrazione fallita" };

	// Supabase returns 200 with an empty identities array when the email is
	// already registered (anti-enumeration). No confirmation email is sent.
	if (data.user.identities?.length === 0) {
		return { success: false, error: "Email già registrata" };
	}

	await insertLegalAcceptances(data.user.id);

	if (!data.session) {
		return {
			success: true,
			status: "pending_email_confirmation",
			email: input.email,
		};
	}

	const profile = await findProfile(getDb(), data.user.id);
	if (!profile) return { success: false, error: "Profilo utente non trovato" };

	return { success: true, status: "logged_in", user: toAuthUser(profile) };
}
