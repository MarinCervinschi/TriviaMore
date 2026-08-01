import { pgEnum } from "drizzle-orm/pg-core"

export const quizModeEnum = pgEnum("quiz_mode", ["STUDY", "EXAM_SIMULATION"])
