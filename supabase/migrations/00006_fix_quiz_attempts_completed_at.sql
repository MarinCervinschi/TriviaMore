-- Fix completed_at to be nullable for in-progress quiz attempts.
-- Previously it defaulted to now() and was NOT NULL, which meant
-- newly created attempts were immediately marked as completed.

ALTER TABLE public.quiz_attempts
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN completed_at DROP DEFAULT;
