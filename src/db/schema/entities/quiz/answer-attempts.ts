import {
  doublePrecision,
  foreignKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { quizSchema } from "../../common"
import { questions } from "../catalog/questions"
import { quizAttempts } from "./quiz-attempts"

export const answerAttempts = quizSchema
  .table(
    "answer_attempts",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      quizAttemptId: uuid("quiz_attempt_id").notNull(),
      questionId: uuid("question_id").notNull(),
      userAnswer: text("user_answer").array().notNull(),
      score: doublePrecision().notNull(),
    },
    (table) => [
      foreignKey({
        columns: [table.questionId],
        foreignColumns: [questions.id],
        name: "answer_attempts_question_id_fkey",
      }).onDelete("cascade"),
      foreignKey({
        columns: [table.quizAttemptId],
        foreignColumns: [quizAttempts.id],
        name: "answer_attempts_quiz_attempt_id_fkey",
      }).onDelete("cascade"),
      unique("answer_attempts_quiz_attempt_id_question_id_key").on(
        table.quizAttemptId,
        table.questionId,
      ),
    ],
  )
  .enableRLS()
