-- The next migration makes "one open attempt per user" a unique index, which
-- refuses to build over a user who already has two. Nothing enforced it before,
-- so keep the one they would have been shown — the newest — and drop the rest
-- along with the quizzes no attempt holds any more.
WITH superseded AS (
  DELETE FROM "quiz"."quiz_attempts" a
  WHERE a."completed_at" IS NULL
    AND EXISTS (
      SELECT 1
      FROM "quiz"."quiz_attempts" newer
      WHERE newer."user_id" = a."user_id"
        AND newer."completed_at" IS NULL
        AND (newer."started_at", newer."id") > (a."started_at", a."id")
    )
  RETURNING a."quiz_id"
)
DELETE FROM "quiz"."quizzes" q
WHERE q."id" IN (SELECT "quiz_id" FROM superseded WHERE "quiz_id" IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "quiz"."quiz_attempts" held WHERE held."quiz_id" = q."id"
  );
