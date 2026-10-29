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

export const accounts = pgTable(
	"accounts",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		// `credential` for a password; otherwise the OAuth provider, with its own user id in `accountId`.
		providerId: text("provider_id").notNull(),
		accountId: text("account_id").notNull(),
		password: text(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
		scope: text(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	table => [
		index("idx_accounts_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
		unique("accounts_provider_id_account_id_key").on(table.providerId, table.accountId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_fkey",
		}).onDelete("cascade"),
	]
).enableRLS();
