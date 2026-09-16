import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { achievements, userAchievements } from "@/db/schema";

import type { Achievement, AchievementUnlock, UserAchievement } from "../types";

export async function findActiveAchievements(db: DbOrTx): Promise<Achievement[]> {
	return db
		.select()
		.from(achievements)
		.where(eq(achievements.isActive, true))
		.orderBy(
			asc(achievements.position),
			asc(achievements.family),
			asc(achievements.tier)
		);
}

export async function findUserAchievements(
	db: DbOrTx,
	userId: string
): Promise<UserAchievement[]> {
	return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}

export async function findAwardedKeysByUser(
	db: DbOrTx,
	userIds?: string[]
): Promise<Map<string, Set<string>>> {
	const rows = await db
		.select({
			userId: userAchievements.userId,
			achievementKey: userAchievements.achievementKey,
		})
		.from(userAchievements)
		.where(userIds ? inArray(userAchievements.userId, userIds) : undefined);

	const byUser = new Map<string, Set<string>>();
	for (const row of rows) {
		const held = byUser.get(row.userId) ?? new Set<string>();
		held.add(row.achievementKey);
		byUser.set(row.userId, held);
	}
	return byUser;
}

/** Returns only the rows this call created, so a concurrent one announces nothing. */
export async function insertAwards(
	db: DbOrTx,
	rows: { userId: string; unlock: AchievementUnlock }[]
): Promise<{ userId: string; achievementKey: string; awardedAt: string }[]> {
	if (rows.length === 0) return [];

	return db
		.insert(userAchievements)
		.values(
			rows.map(row => ({
				userId: row.userId,
				achievementKey: row.unlock.key,
				metricValue: row.unlock.metricValue,
			}))
		)
		.onConflictDoNothing()
		.returning({
			userId: userAchievements.userId,
			achievementKey: userAchievements.achievementKey,
			awardedAt: userAchievements.awardedAt,
		});
}

export async function clearPins(db: DbOrTx, userId: string) {
	await db
		.update(userAchievements)
		.set({ pinPosition: null })
		.where(
			and(eq(userAchievements.userId, userId), isNotNull(userAchievements.pinPosition))
		);
}

/** Returns false when the user does not hold the badge — a pin is never a grant. */
export async function setPin(
	db: DbOrTx,
	userId: string,
	achievementKey: string,
	position: number
): Promise<boolean> {
	const updated = await db
		.update(userAchievements)
		.set({ pinPosition: position })
		.where(
			and(
				eq(userAchievements.userId, userId),
				eq(userAchievements.achievementKey, achievementKey)
			)
		)
		.returning({ key: userAchievements.achievementKey });

	return updated.length > 0;
}
