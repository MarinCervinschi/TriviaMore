import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";

import { type DbOrTx, getDb } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { log } from "@/lib/logging/server";
import { createNotification } from "@/lib/notifications/service";
import { Invalid } from "@/lib/server/errors";

import { readMetricSnapshots } from "./db/metrics";
import { evaluate, notifiableUnlocks, progressOf } from "./rules";
import type {
	Achievement,
	AchievementCategory,
	AchievementUnlock,
	AchievementView,
	AchievementsOverview,
	UnlockedAchievement,
	UserAchievement,
} from "./types";

const AWARD_CHUNK = 500;

function findActiveAchievements(db: DbOrTx): Promise<Achievement[]> {
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

function findUserAchievements(db: DbOrTx, userId: string): Promise<UserAchievement[]> {
	return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}

async function findAwardedKeysByUser(
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
function insertAwards(
	db: DbOrTx,
	rows: { userId: string; unlock: AchievementUnlock }[]
): Promise<{ userId: string; achievementKey: string; awardedAt: string }[]> {
	if (rows.length === 0) return Promise.resolve([]);

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

async function clearPins(db: DbOrTx, userId: string) {
	await db
		.update(userAchievements)
		.set({ pinPosition: null })
		.where(
			and(eq(userAchievements.userId, userId), isNotNull(userAchievements.pinPosition))
		);
}

/** Returns false when the user does not hold the badge — a pin is never a grant. */
async function setPin(
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

async function notifyUnlocks(
	userId: string,
	unlocks: AchievementUnlock[],
	catalogue: Achievement[]
) {
	const byKey = new Map(catalogue.map(entry => [entry.key, entry]));

	for (const unlock of notifiableUnlocks(unlocks, catalogue)) {
		const entry = byKey.get(unlock.key);
		if (!entry) continue;

		await createNotification(getDb(), {
			userId,
			type: "ACHIEVEMENT_UNLOCKED",
			title: `Nuovo traguardo: ${entry.name}`,
			body: entry.description,
			referenceId: entry.key,
			referenceType: "achievement",
			link: "/user/achievements",
		});
	}
}

/**
 * Evaluates one user against the catalogue. Runs *after* the transaction that
 * produced the event: the query must see the new row, and a failure here must not
 * roll it back.
 */
export async function evaluateAchievements(
	userId: string,
	options?: { notify?: boolean }
): Promise<UnlockedAchievement[]> {
	const db = getDb();
	const catalogue = await findActiveAchievements(db);
	if (catalogue.length === 0) return [];

	const [snapshots, awardedByUser] = await Promise.all([
		readMetricSnapshots(db, userId),
		findAwardedKeysByUser(db, [userId]),
	]);

	const snapshot = snapshots[0];
	if (!snapshot) return [];

	const unlocks = evaluate(
		catalogue,
		snapshot.metrics,
		awardedByUser.get(userId) ?? new Set()
	);
	if (unlocks.length === 0) return [];

	const inserted = await insertAwards(
		db,
		unlocks.map(unlock => ({ userId, unlock }))
	);
	const insertedKeys = new Set(inserted.map(row => row.achievementKey));
	const created = unlocks.filter(unlock => insertedKeys.has(unlock.key));

	if (created.length > 0 && options?.notify !== false) {
		await notifyUnlocks(userId, created, catalogue);
	}

	const byKey = new Map(catalogue.map(entry => [entry.key, entry]));
	return created
		.map(unlock => byKey.get(unlock.key))
		.filter((entry): entry is Achievement => entry !== undefined)
		.map(({ key, name, description, icon, accent, shape, tier }) => ({
			key,
			name,
			description,
			icon,
			accent,
			shape,
			tier,
		}));
}

/** Awaited, but never able to fail the caller: the quiz is already committed. */
export async function evaluateAchievementsSafely(
	userId: string
): Promise<UnlockedAchievement[]> {
	try {
		return await evaluateAchievements(userId);
	} catch (error) {
		log.error("Achievement evaluation failed", { userId }, error);
		return [];
	}
}

/** Fire and forget: the replay recovers whatever a swallowed error loses. */
export function evaluateAchievementsInBackground(userId: string): void {
	void evaluateAchievements(userId).catch(error => {
		log.error("Achievement evaluation failed", { userId }, error);
	});
}

/**
 * Awards everything every user has already earned — a badge added later still
 * reaches whoever met its rule. Silent by default: a backfill would otherwise drop
 * a dozen unread rows on every account.
 */
export async function replayAchievements(options?: {
	notify?: boolean;
	dryRun?: boolean;
}): Promise<{ users: number; awarded: number }> {
	const db = getDb();
	const catalogue = await findActiveAchievements(db);
	if (catalogue.length === 0) return { users: 0, awarded: 0 };

	const [snapshots, awardedByUser] = await Promise.all([
		readMetricSnapshots(db),
		findAwardedKeysByUser(db),
	]);

	const pending: { userId: string; unlock: AchievementUnlock }[] = [];
	for (const snapshot of snapshots) {
		const unlocks = evaluate(
			catalogue,
			snapshot.metrics,
			awardedByUser.get(snapshot.userId) ?? new Set()
		);
		for (const unlock of unlocks) {
			pending.push({ userId: snapshot.userId, unlock });
		}
	}

	if (options?.dryRun) {
		return { users: snapshots.length, awarded: pending.length };
	}

	const byUser = new Map<string, AchievementUnlock[]>();
	const unlockByRow = new Map(
		pending.map(row => [`${row.userId}\u0000${row.unlock.key}`, row.unlock])
	);

	let awarded = 0;
	for (let index = 0; index < pending.length; index += AWARD_CHUNK) {
		const inserted = await insertAwards(db, pending.slice(index, index + AWARD_CHUNK));
		awarded += inserted.length;

		// From the rows the insert created, never from `pending`: a live evaluation
		// running alongside a long replay already awarded — and announced — some of
		// these, and `onConflictDoNothing` is what tells the two apart.
		for (const row of inserted) {
			const unlock = unlockByRow.get(`${row.userId}\u0000${row.achievementKey}`);
			if (unlock) byUser.set(row.userId, [...(byUser.get(row.userId) ?? []), unlock]);
		}
	}

	if (options?.notify) {
		for (const [userId, unlocks] of byUser) {
			await notifyUnlocks(userId, unlocks, catalogue);
		}
	}

	log.info("Achievements replayed {Users} {Awarded}", {
		Users: snapshots.length,
		Awarded: awarded,
	});

	return { users: snapshots.length, awarded };
}

const PIN_LIMIT = 3;
const NEXT_UP = 3;

function toView(
	entry: Achievement,
	award: { awardedAt: string; pinPosition: number | null } | undefined,
	metrics: Parameters<typeof progressOf>[1] | undefined
): AchievementView {
	return {
		key: entry.key,
		family: entry.family,
		tier: entry.tier,
		name: entry.name,
		description: entry.description,
		category: entry.category,
		metric: entry.metric,
		icon: entry.icon,
		accent: entry.accent,
		shape: entry.shape,
		awardedAt: award?.awardedAt ?? null,
		progress: award || !metrics ? null : progressOf(entry, metrics),
		pinPosition: award?.pinPosition ?? null,
	};
}

/**
 * The whole page in one call: the catalogue and this user's standing against it.
 *
 * `heal: false` makes it a pure read — `pnpm smoke:reads` runs against the live
 * database and must not award anything on its way past.
 */
export async function getAchievements(
	userId: string,
	options?: { heal?: boolean }
): Promise<AchievementsOverview> {
	const db = getDb();
	const [catalogue, awards, snapshots] = await Promise.all([
		findActiveAchievements(db),
		findUserAchievements(db, userId),
		readMetricSnapshots(db, userId),
	]);

	const awardByKey = new Map<string, { awardedAt: string; pinPosition: number | null }>(
		awards.map(award => [
			award.achievementKey,
			{ awardedAt: award.awardedAt, pinPosition: award.pinPosition },
		])
	);
	const metrics = snapshots[0]?.metrics;

	// Self-healing, on the data already in hand: a rule can be met without any
	// trigger firing, and a fire-and-forget evaluation can be lost. Lazy and scoped,
	// like the reaper in `startQuiz`. Silent, because a repair is not an event —
	// to announce a badge added later, run the replay with --notify.
	if (metrics && options?.heal !== false) {
		const pending = evaluate(catalogue, metrics, new Set(awardByKey.keys()));
		if (pending.length > 0) {
			const inserted = await insertAwards(
				db,
				pending.map(unlock => ({ userId, unlock }))
			);
			for (const row of inserted) {
				awardByKey.set(row.achievementKey, {
					awardedAt: row.awardedAt,
					pinPosition: null,
				});
			}
		}
	}

	const views = catalogue.map(entry =>
		toView(entry, awardByKey.get(entry.key), metrics)
	);

	// Keyed, not by runs of adjacent rows: a badge inserted from the console defaults
	// to `position` 0 and sorts away from its category, which would otherwise split it
	// into two tabs with the same name — and the second one is unreachable.
	const categories: AchievementCategory[] = [];
	const byCategory = new Map<string, AchievementCategory>();
	for (const view of views) {
		const group = byCategory.get(view.category);
		if (group) group.achievements.push(view);
		else {
			const created = { category: view.category, achievements: [view] };
			byCategory.set(view.category, created);
			categories.push(created);
		}
	}

	const nextUp = views
		.filter(view => view.awardedAt === null && view.progress !== null)
		.sort((a, b) => b.progress!.ratio - a.progress!.ratio)
		.slice(0, NEXT_UP);

	const pinned = views
		.filter(view => view.pinPosition !== null)
		.sort((a, b) => a.pinPosition! - b.pinPosition!)
		.slice(0, PIN_LIMIT);

	return {
		categories,
		unlocked: views.filter(view => view.awardedAt !== null).length,
		total: views.length,
		nextUp,
		pinned,
	};
}

/** Replaces the pinned set wholesale, in the order given. */
export async function setPinnedAchievements(userId: string, keys: string[]) {
	if (keys.length > PIN_LIMIT) {
		throw new Invalid(`Puoi mettere in evidenza al massimo ${PIN_LIMIT} traguardi`);
	}
	if (new Set(keys).size !== keys.length) {
		throw new Invalid("Un traguardo può comparire una volta sola");
	}

	await getDb().transaction(async tx => {
		await clearPins(tx, userId);
		for (const [index, key] of keys.entries()) {
			const pinned = await setPin(tx, userId, key, index);
			if (!pinned)
				throw new Invalid("Puoi mettere in evidenza solo i traguardi che hai");
		}
	});
}
