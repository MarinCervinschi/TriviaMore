import { date, foreignKey, integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

/**
 * One row per active day, in Europe/Rome — the zone the streak is counted in.
 * The streak and the active weeks are derived from this at read time: a year of
 * study is ~365 rows, so the windowing that used to run over the whole answer
 * history is now cheap enough to leave as a query, with no state to keep in sync.
 */
export const userDayActivity = pgTable(
	"user_day_activity",
	{
		userId: uuid("user_id").notNull(),
		day: date({ mode: "string" }).notNull(),
		quizzes: integer().default(0).notNull(),
		flashcards: integer().default(0).notNull(),
	},
	table => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_day_activity_user_id_fkey",
		}).onDelete("cascade"),
		primaryKey({
			columns: [table.userId, table.day],
			name: "user_day_activity_pkey",
		}),
	]
).enableRLS();
