import { redirect } from "@tanstack/react-router";

import { getDb } from "@/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { findCurrentEnrollment } from "./db/enrollments";

// Runs after requireAuth: with no user it returns silently, because the auth
// guard wrapping it has already redirected.
export async function requireEnrollment(): Promise<void> {
	const supabase = createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return;

	const enrollment = await findCurrentEnrollment(getDb(), user.id);
	if (!enrollment) throw redirect({ to: "/onboarding" });
}
