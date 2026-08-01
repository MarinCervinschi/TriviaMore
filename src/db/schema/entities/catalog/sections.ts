import { sql } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { classes } from "./classes"

export const sections = catalogSchema
  .table(
    "sections",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      name: text().notNull(),
      description: text(),
      isPublic: boolean("is_public").default(true).notNull(),
      classId: uuid("class_id").notNull(),
      position: integer().default(0).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
      slug: text().generatedAlwaysAs(
        sql`lower(replace(name, ' '::text, '-'::text))`,
      ),
    },
    (table) => [
      index("idx_sections_position").using(
        "btree",
        table.position.asc().nullsLast().op("int4_ops"),
      ),
      uniqueIndex("sections_class_id_slug_key").using(
        "btree",
        table.classId.asc().nullsLast().op("uuid_ops"),
        table.slug.asc().nullsLast().op("text_ops"),
      ),
      foreignKey({
        columns: [table.classId],
        foreignColumns: [classes.id],
        name: "sections_class_id_fkey",
      }).onDelete("cascade"),
    ],
  )
  .enableRLS()
