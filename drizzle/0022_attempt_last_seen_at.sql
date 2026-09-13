DROP INDEX "quiz"."idx_quiz_attempts_user_open";--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_quiz_attempts_user_open" ON "quiz"."quiz_attempts" USING btree ("user_id" uuid_ops) WHERE completed_at IS NULL;