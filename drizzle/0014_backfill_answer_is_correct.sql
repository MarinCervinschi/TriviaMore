-- Freeze the correctness verdict for existing answers: exact match of the stored
-- answer against the question's current correct answer, as a set (order-independent).
-- Rows whose question was deleted (question_id null) stay null — the verdict is
-- unknowable without the question.
UPDATE "quiz"."answer_attempts" aa
SET "is_correct" = (
	(SELECT array_agg(x ORDER BY x) FROM unnest(aa."user_answer") AS x)
	IS NOT DISTINCT FROM
	(SELECT array_agg(x ORDER BY x) FROM unnest(qn."correct_answer") AS x)
)
FROM "catalog"."questions" qn
WHERE aa."question_id" = qn."id"
  AND aa."is_correct" IS NULL;
