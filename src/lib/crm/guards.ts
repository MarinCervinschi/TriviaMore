import { redirect } from "@tanstack/react-router";

import { getDb } from "@/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { findCurrentEnrollment } from "./db/enrollments";

// Returns silently with no user, because the auth guard around it has already redirected.
export async function requireEnrollment(): Promise<void> {
	const supabase = createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return;

	const enrollment = await findCurrentEnrollment(getDb(), user.id);
	if (!enrollment) throw redirect({ to: "/onboarding" });
}
