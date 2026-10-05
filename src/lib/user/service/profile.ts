import { eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { findProfile } from "@/lib/auth/db/profiles";
import { findCompletedAttemptHistory } from "@/lib/quiz/db/attempts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { UserProfile, UserStats } from "../types";
import { getRecentClasses } from "./classes";

const RECENT_ATTEMPTS_LIMIT = 5;

// `average_score` is the mean of the per-section averages, ignoring sections with no completed run.
async function getStats(userId: string): Promise<UserStats> {
	const [row] = await getDb()
		.select({
			quizAttemptsCount: sql<number>`(
        select count(*) from quiz.quiz_attempts
         where user_id = ${userId} and completed_at is not null
      )`.mapWith(Number),
			userClassesCount: sql<number>`(
        select count(*) from user_classes where user_id = ${userId}
      )`.mapWith(Number),
			bookmarksCount: sql<number>`(
        select count(*) from bookmarks where user_id = ${userId}
      )`.mapWith(Number),
			totalQuizzes: sql<number>`(
        select count(*) from quiz.quiz_attempts
         where user_id = ${userId} and completed_at is not null
      )`.mapWith(Number),
			averageScore: sql<number>`(
        select coalesce(round(avg(score)::numeric, 2), 0)
          from quiz.quiz_attempts
         where user_id = ${userId} and completed_at is not null
      )`.mapWith(Number),
		})
		.from(sql`(select 1) as one`);

	return row;
}

export async function getUserProfile(
	userId: string | null
): Promise<UserProfile | null> {
	if (!userId) return null;
	const db = getDb();

	const profile = await findProfile(db, userId);
	if (!profile) return null;

	const [stats, recentClasses, recentAttempts] = await Promise.all([
		getStats(userId),
		getRecentClasses(db, userId),
		findCompletedAttemptHistory(db, userId, undefined, RECENT_ATTEMPTS_LIMIT),
	]);

	return {
		...profile,
		stats,
		recentClasses,
		// completedAt is nullable on the row but the query filters it out.
		recentQuizAttempts: recentAttempts.map(attempt => ({
			...attempt,
			completedAt: attempt.completedAt!,
		})),
	};
}

export async function updateProfile(
	userId: string,
	input: { name: string; image?: string | null }
) {
	// An absent `image` leaves the stored one alone; only an explicit null clears it.
	await getDb()
		.update(profiles)
		.set({
			name: input.name,
			image: input.image === undefined ? undefined : input.image,
		})
		.where(eq(profiles.id, userId));

	// Duplicated into the auth user's metadata, which OAuth and the email templates read.
	await createServerSupabaseClient().auth.updateUser({
		data: { name: input.name },
	});

	return { success: true };
}
