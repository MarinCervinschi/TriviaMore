import { foreignKey, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";

import { internalSchema } from "../../common";
import { sections } from "../catalog/sections";
import { profiles } from "../public/profiles";

export const sectionAccess = internalSchema
	.table(
		"section_access",
		{
			userId: uuid("user_id").notNull(),
			sectionId: uuid("section_id").notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "section_access_section_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "section_access_user_id_fkey",
			}).onDelete("cascade"),
			primaryKey({
				columns: [table.userId, table.sectionId],
				name: "section_access_pkey",
			}),
		]
	)
	.enableRLS();
