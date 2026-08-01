// Declared with pgEnum, not catalogSchema.enum: every enum type lives in the
// public Postgres schema because it is shared across catalog, quiz and public.
import { pgEnum } from "drizzle-orm/pg-core"

export const departmentAreaEnum = pgEnum("department_area", [
  "SCIENZE",
  "TECNOLOGIA",
  "SALUTE",
  "VITA",
  "SOCIETA_CULTURA",
])

export const campusLocationEnum = pgEnum("campus_location", [
  "MODENA",
  "REGGIO_EMILIA",
  "CARPI",
  "MANTOVA",
])

export const courseTypeEnum = pgEnum("course_type", [
  "BACHELOR",
  "MASTER",
  "SINGLE_CYCLE",
])

export const questionTypeEnum = pgEnum("question_type", [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
])

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"])
