import { customType, pgSchema } from "drizzle-orm/pg-core"

export const catalogSchema = pgSchema("catalog")
export const quizSchema = pgSchema("quiz")
export const internalSchema = pgSchema("internal")

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector"
  },
})
