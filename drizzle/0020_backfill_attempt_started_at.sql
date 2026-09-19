-- The new column defaults to now(), which would claim every historical attempt
-- started the day of this migration. A finished attempt knows better: it recorded
-- how long it took, so the start is its completion minus that duration (time_spent
-- is milliseconds). Attempts that never recorded one fall back to the completion
-- instant. Open attempts keep now() — nothing in the row says when they began, and
-- the reaper's horizon then runs from here, which is the forgiving direction.
UPDATE "quiz"."quiz_attempts"
SET "started_at" = "completed_at" - COALESCE("time_spent", 0) * interval '1 millisecond'
WHERE "completed_at" IS NOT NULL;
