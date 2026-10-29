import { redirect } from "@tanstack/react-router";

import { getDb } from "@/db";
import { readSession } from "@/lib/auth/server";

import { findCurrentEnrollment } from "./db/enrollments";

// Returns silently with no user, because the auth guard around it has already redirected.
export async function requireEnrollment(): Promise<void> {
	const session = await readSession();
	if (!session) return;

	const enrollment = await findCurrentEnrollment(getDb(), session.user.id);
	if (!enrollment) throw redirect({ to: "/onboarding" });
}
