ALTER TABLE "quiz"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_id_fkey";
--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" DROP CONSTRAINT "answer_attempts_question_id_fkey";
--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ALTER COLUMN "quiz_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ALTER COLUMN "question_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD COLUMN "section_id" uuid;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD COLUMN "quiz_mode" "quiz_mode";--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD COLUMN "section_id" uuid;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD COLUMN "difficulty" "difficulty";--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD COLUMN "question_type" "question_type";--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD COLUMN "time_spent" integer;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"."quizzes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD CONSTRAINT "answer_attempts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD CONSTRAINT "answer_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "catalog"."questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_section_id" ON "quiz"."quiz_attempts" USING btree ("section_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_answer_attempts_section_id" ON "quiz"."answer_attempts" USING btree ("section_id" uuid_ops);