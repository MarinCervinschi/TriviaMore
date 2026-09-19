import { authUsers } from "drizzle-orm/supabase"
import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { roleEnum } from "./enums"

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    name: text(),
    email: text(),
    image: text(),
    role: roleEnum().default("STUDENT").notNull(),
    // Position in signup order, immutable once set. Stored because deriving it
    // meant ranking the whole table on every achievement evaluation.
    signupRank: integer("signup_rank"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_profiles_role").using("btree", table.role.asc().nullsLast().op("enum_ops")),
    foreignKey({
      columns: [table.id],
      foreignColumns: [authUsers.id],
      name: "profiles_id_fkey",
    }).onDelete("cascade"),
    unique("profiles_email_key").on(table.email),
  ],
).enableRLS()
