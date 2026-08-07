import { sql } from "drizzle-orm";
import { index, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogSchema, tsvector } from "../../common";

export const classes = catalogSchema
	.table(
		"classes",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			name: text().notNull(),
			description: text(),
			cfu: integer(),
			position: integer().default(0).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			fts: tsvector("fts").generatedAlwaysAs(
				sql`to_tsvector('italian'::regconfig, COALESCE(name, ''::text))`
			),
		},
		table => [
			index("classes_fts_idx").using(
				"gin",
				table.fts.asc().nullsLast().op("tsvector_ops")
			),
			index("idx_classes_position").using(
				"btree",
				table.position.asc().nullsLast().op("int4_ops")
			),
		]
	)
	.enableRLS();
