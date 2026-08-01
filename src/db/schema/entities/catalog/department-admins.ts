import { foreignKey, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { profiles } from "../public/profiles"
import { departments } from "./departments"

export const departmentAdmins = catalogSchema
  .table(
    "department_admins",
    {
      userId: uuid("user_id").notNull(),
      departmentId: uuid("department_id").notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      foreignKey({
        columns: [table.departmentId],
        foreignColumns: [departments.id],
        name: "department_admins_department_id_fkey",
      }).onDelete("cascade"),
      foreignKey({
        columns: [table.userId],
        foreignColumns: [profiles.id],
        name: "department_admins_user_id_fkey",
      }).onDelete("cascade"),
      primaryKey({
        columns: [table.userId, table.departmentId],
        name: "department_admins_pkey",
      }),
    ],
  )
  .enableRLS()
