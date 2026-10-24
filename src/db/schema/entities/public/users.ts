import { boolean, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		image: text(),
		// Date, not string: Better Auth reads and writes these columns.
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	table => [unique("users_email_key").on(table.email)]
).enableRLS();
