import { sql } from "drizzle-orm"
import {
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { catalogSchema, tsvector } from "../../common"
import { campusLocationEnum, courseTypeEnum } from "./enums"
import { departments } from "./departments"

export const courses = catalogSchema
  .table(
    "courses",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      name: text().notNull(),
      code: text().notNull(),
      description: text(),
      departmentId: uuid("department_id").notNull(),
      location: campusLocationEnum(),
      cfu: integer(),
      position: integer().default(0).notNull(),
      courseType: courseTypeEnum("course_type").default("BACHELOR").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
      fts: tsvector("fts").generatedAlwaysAs(
        sql`to_tsvector('italian'::regconfig, ((COALESCE(name, ''::text) || ' '::text) || COALESCE(code, ''::text)))`,
      ),
    },
    (table) => [
      index("courses_fts_idx").using(
        "gin",
        table.fts.asc().nullsLast().op("tsvector_ops"),
      ),
      index("idx_courses_position").using(
        "btree",
        table.position.asc().nullsLast().op("int4_ops"),
      ),
      foreignKey({
        columns: [table.departmentId],
        foreignColumns: [departments.id],
        name: "courses_department_id_fkey",
      }).onDelete("cascade"),
      unique("courses_code_department_id_key").on(table.code, table.departmentId),
    ],
  )
  .enableRLS()
