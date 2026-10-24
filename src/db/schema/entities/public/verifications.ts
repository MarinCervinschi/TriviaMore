import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const verifications = pgTable(
	"verifications",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	table => [
		index("idx_verifications_identifier").using(
			"btree",
			table.identifier.asc().nullsLast().op("text_ops")
		),
	]
).enableRLS();
