-- Not `ALTER TYPE ... ADD VALUE`: drizzle applies every pending migration inside
-- one transaction, and Postgres refuses to *use* a value added to an already
-- committed enum in the transaction that added it — so 0034's insert fails on any
-- database past 0024, which is every environment. Recreating the type sidesteps
-- the rule: the values of a type created in the current transaction are safe at
-- once. `public.achievements.metric` is the only column that depends on it.
ALTER TYPE "public"."achievement_metric" RENAME TO "achievement_metric_old";--> statement-breakpoint
CREATE TYPE "public"."achievement_metric" AS ENUM('QUIZZES_COMPLETED', 'DISTINCT_SECTIONS', 'DISTINCT_CLASSES', 'DISTINCT_DEPARTMENTS', 'PERFECT_QUIZZES', 'HARD_CORRECT', 'EXAM_SIMS_PASSED', 'MAX_SECTION_IMPROVEMENT', 'ACTIVE_WEEKS', 'BEST_DAY_STREAK', 'TOTAL_TIME_MS', 'FLASHCARD_SESSIONS', 'BOOKMARKED_THEN_CORRECT', 'APPROVED_REQUESTS', 'SIGNUP_RANK', 'ENROLLMENT_DECLARED');--> statement-breakpoint
ALTER TABLE "public"."achievements" ALTER COLUMN "metric" SET DATA TYPE "public"."achievement_metric" USING "metric"::text::"public"."achievement_metric";--> statement-breakpoint
DROP TYPE "public"."achievement_metric_old";
