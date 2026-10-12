UPDATE "quiz"."quiz_attempts" qa
SET "section_id" = q."section_id",
    "quiz_mode" = q."quiz_mode"
FROM "quiz"."quizzes" q
WHERE qa."quiz_id" = q."id"
  AND qa."section_id" IS NULL;
--> statement-breakpoint
UPDATE "quiz"."answer_attempts" aa
SET "section_id" = qn."section_id",
    "difficulty" = qn."difficulty",
    "question_type" = qn."question_type"
FROM "catalog"."questions" qn
WHERE aa."question_id" = qn."id"
  AND aa."section_id" IS NULL;
