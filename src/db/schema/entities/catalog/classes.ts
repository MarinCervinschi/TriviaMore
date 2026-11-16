import { index, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";

export const classes = catalogSchema
	.table(
		"classes",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			name: text().notNull(),
			description: text(),
			cfu: integer(),
			ssd: text(),
			position: integer().default(0).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_classes_position").using(
				"btree",
				table.position.asc().nullsLast().op("int4_ops")
			),
		]
	)
	.enableRLS();
