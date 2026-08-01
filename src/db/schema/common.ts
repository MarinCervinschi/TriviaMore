import { customType, pgSchema } from "drizzle-orm/pg-core"

export const catalogSchema = pgSchema("catalog")
export const quizSchema = pgSchema("quiz")

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector"
  },
})
