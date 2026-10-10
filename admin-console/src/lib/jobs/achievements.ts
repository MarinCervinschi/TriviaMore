import { sql } from "drizzle-orm";
import { inArray } from "drizzle-orm";
import { z } from "zod";

import { achievementMetricEnum, achievements, profiles } from "@/db/schema";
import {
	reconcileAchievementMetrics,
	replayAchievements,
} from "@/lib/achievements/service";

import type { ConsoleDb } from "~/lib/db/client";

import { changesOf, section } from "./changes";
import type { JobDefinition } from "./types";

/** The owner reads these: a name and an email say whose counters or badges they are. */
async function peopleOf(db: ConsoleDb, ids: string[]) {
	if (ids.length === 0) return new Map<string, { label: string; detail?: string }>();
	const rows = await db
		.select({ id: profiles.id, name: profiles.name, email: profiles.email })
		.from(profiles)
		.where(inArray(profiles.id, [...new Set(ids)]));
	return new Map(
		rows.map(row => [
			row.id,
			{
				label: row.name ?? row.email ?? row.id,
				detail: row.name ? (row.email ?? undefined) : undefined,
			},
		])
	);
}

/** Stops before a run that would read metrics the database's migrations do not have yet. */
async function requireCatalogue(db: ConsoleDb) {
	const { rows } = await db.execute<{ metric: string }>(
		sql`select unnest(enum_range(null::public.achievement_metric))::text as metric`
	);
	const present = new Set(rows.map(row => row.metric));
	const missing = achievementMetricEnum.enumValues.filter(
		metric => !present.has(metric)
	);
	if (missing.length > 0) {
		throw new Error(
			`Mancano delle migration: il database non conosce ${missing.join(", ")}.`
		);
	}
}

const noParams = z.object({});

export const achievementsRollups: JobDefinition<typeof noParams> = {
	name: "achievements.rollups",
	label: "Ricostruisci i contatori",
	area: "Traguardi",
	description:
		"Ricalcola i contatori dei traguardi dallo storico di quiz e flashcard e dice quali erano andati fuori strada. Riscriverli non rischia niente: lo storico resta la fonte.",
	simulates: false,
	command: "pnpm achievements:reconcile",
	terminal: { dryRun: "", apply: "--repair" },
	params: noParams,
	fields: [],
	async run(_params, { db, dryRun }) {
		await requireCatalogue(db);
		const { users, drift } = await reconcileAchievementMetrics({ db, repair: !dryRun });
		const people = await peopleOf(
			db,
			drift.map(entry => entry.userId)
		);
		return {
			summary: {
				Utenti: users,
				"Utenti con derive": new Set(drift.map(entry => entry.userId)).size,
				[dryRun ? "Metriche derivate" : "Metriche corrette"]: drift.length,
			},
			changes: changesOf(
				section(
					"drift",
					"Contatori derivati",
					drift.map(entry => {
						const person = people.get(entry.userId);
						return {
							kind: "updated",
							label: person?.label ?? entry.userId,
							detail: [person?.detail, entry.metric].filter(Boolean).join(" · "),
							fields: [
								{ name: entry.metric, before: entry.stored, after: entry.computed },
							],
						};
					})
				)
			),
		};
	},
};

const replayParams = z.object({ notify: z.string().optional() });

export const achievementsReplay: JobDefinition<typeof replayParams> = {
	name: "achievements.replay",
	label: "Assegna i traguardi",
	area: "Traguardi",
	description:
		"Dà a ogni utente i traguardi che ha già raggiunto e non ha ancora, per esempio dopo un badge nuovo nel catalogo.",
	command: "pnpm achievements:replay",
	terminal: { dryRun: "--dry-run", apply: "" },
	params: replayParams,
	fields: [
		{
			key: "notify",
			label: "Avvisa gli utenti",
			description:
				"Manda una notifica per ogni traguardo assegnato. Senza, li assegna in silenzio.",
			options: [
				{ value: "", label: "No, in silenzio" },
				{ value: "yes", label: "Sì, con una notifica" },
			],
			flag: "--notify",
			toggle: true,
		},
	],
	async run({ notify }, { db, dryRun }) {
		await requireCatalogue(db);
		// On counters that drifted, an award would be missed or given early, and the run would not say so.
		const { drift } = await reconcileAchievementMetrics({ db });
		if (drift.length > 0) {
			throw new Error(
				`I contatori hanno ${drift.length} derive: esegui prima «Ricostruisci i contatori».`
			);
		}
		const result = await replayAchievements({ db, dryRun, notify: Boolean(notify) });
		const people = await peopleOf(
			db,
			result.awards.map(award => award.userId)
		);
		const badges = new Map(
			(
				await db
					.select({
						key: achievements.key,
						name: achievements.name,
						category: achievements.category,
						icon: achievements.icon,
						accent: achievements.accent,
						shape: achievements.shape,
						tier: achievements.tier,
					})
					.from(achievements)
			).map(row => [row.key, row])
		);
		return {
			summary: {
				Utenti: result.users,
				[dryRun ? "Da assegnare" : "Assegnati"]: result.awarded,
			},
			changes: changesOf(
				section(
					"awards",
					"Traguardi",
					result.awards.map(award => {
						const person = people.get(award.userId);
						const badge = badges.get(award.key);
						return {
							kind: "added",
							label: person?.label ?? award.userId,
							detail: person?.detail,
							badge: badge && {
								icon: badge.icon,
								accent: badge.accent,
								shape: badge.shape,
								tier: badge.tier,
							},
							fields: [
								{
									name: badge?.category ?? "Traguardo",
									before: null,
									after: badge?.name ?? award.key,
								},
							],
						};
					})
				)
			),
		};
	},
};
