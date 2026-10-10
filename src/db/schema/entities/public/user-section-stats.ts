import { doublePrecision, foreignKey, integer, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";

import { sections } from "../catalog/sections";
import { profiles } from "./profiles";

export const userSectionStats = pgTable(
	"user_section_stats",
	{
		userId: uuid("user_id").notNull(),
		sectionId: uuid("section_id").notNull(),
		runs: integer().default(0).notNull(),
		firstScore: doublePrecision("first_score"),
		lastScore: doublePrecision("last_score"),
		firstAt: timestamp("first_at", { withTimezone: true, mode: "string" }),
		lastAt: timestamp("last_at", { withTimezone: true, mode: "string" }),
	},
	table => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_section_stats_user_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.sectionId],
			foreignColumns: [sections.id],
			name: "user_section_stats_section_id_fkey",
		}).onDelete("cascade"),
		primaryKey({
			columns: [table.userId, table.sectionId],
			name: "user_section_stats_pkey",
		}),
	]
).enableRLS();
