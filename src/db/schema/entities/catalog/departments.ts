import { index, integer, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { departmentAreaEnum } from "./enums"

export const departments = catalogSchema
  .table(
    "departments",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      name: text().notNull(),
      code: text().notNull(),
      description: text(),
      area: departmentAreaEnum(),
      position: integer().default(0).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      index("idx_departments_position").using(
        "btree",
        table.position.asc().nullsLast().op("int4_ops"),
      ),
      unique("departments_code_key").on(table.code),
    ],
  )
  .enableRLS()
