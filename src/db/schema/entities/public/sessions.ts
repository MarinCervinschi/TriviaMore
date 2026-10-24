import {
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const sessions = pgTable(
	"sessions",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		token: text().notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	table => [
		index("idx_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
		unique("sessions_token_key").on(table.token),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey",
		}).onDelete("cascade"),
	]
).enableRLS();
