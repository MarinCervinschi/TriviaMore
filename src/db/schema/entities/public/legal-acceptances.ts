import {
  foreignKey,
  index,
  inet,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { legalDocumentTypeEnum } from "./enums"
import { profiles } from "./profiles"

export const legalAcceptances = pgTable(
  "legal_acceptances",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    documentType: legalDocumentTypeEnum("document_type").notNull(),
    version: text().notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("idx_legal_acceptances_lookup").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.documentType.asc().nullsLast().op("enum_ops"),
      table.version.asc().nullsLast().op("text_ops"),
    ),
    index("idx_legal_acceptances_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "legal_acceptances_user_id_fkey",
    }).onDelete("cascade"),
  ],
).enableRLS()
