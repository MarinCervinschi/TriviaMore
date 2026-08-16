CREATE TABLE "quiz"."flashcard_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"section_id" uuid,
	"cards_reviewed" integer,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz"."flashcard_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz"."flashcard_attempts" ADD CONSTRAINT "flashcard_attempts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."flashcard_attempts" ADD CONSTRAINT "flashcard_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempts_completed_at" ON "quiz"."flashcard_attempts" USING btree ("completed_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempts_section_id" ON "quiz"."flashcard_attempts" USING btree ("section_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_flashcard_attempts_user_id" ON "quiz"."flashcard_attempts" USING btree ("user_id" uuid_ops);