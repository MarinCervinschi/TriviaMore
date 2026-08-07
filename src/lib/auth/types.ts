import type { Session } from "@supabase/supabase-js";

import type { profiles } from "@/db/schema";

export type Profile = typeof profiles.$inferSelect;
export type UserRole = Profile["role"];

// The subset of the profile every authenticated surface needs. `email` is
// nullable on the row but always set for a user who can log in.
export type AuthUser = {
	id: string;
	email: string;
	name: string | null;
	image: string | null;
	role: UserRole;
};

export type AuthSession = {
	user: AuthUser;
	supabaseSession: Session;
};

export type AuthResult =
	| { success: true; user: AuthUser }
	| { success: false; error: string };

export type SignupResult =
	| { success: true; status: "logged_in"; user: AuthUser }
	| { success: true; status: "pending_email_confirmation"; email: string }
	| { success: false; error: string };
