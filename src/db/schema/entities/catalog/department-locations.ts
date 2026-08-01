import {
  boolean,
  foreignKey,
  index,
  numeric,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { campusLocationEnum } from "./enums"
import { departments } from "./departments"

export const departmentLocations = catalogSchema
  .table(
    "department_locations",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      departmentId: uuid("department_id").notNull(),
      name: text().notNull(),
      address: text().notNull(),
      latitude: numeric().notNull(),
      longitude: numeric().notNull(),
      campusLocation: campusLocationEnum("campus_location"),
      isPrimary: boolean("is_primary").default(false),
      position: smallint().default(0),
      createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "string",
      }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      index("idx_department_locations_dept").using(
        "btree",
        table.departmentId.asc().nullsLast().op("uuid_ops"),
      ),
      foreignKey({
        columns: [table.departmentId],
        foreignColumns: [departments.id],
        name: "department_locations_department_id_fkey",
      }).onDelete("cascade"),
    ],
  )
  .enableRLS()
