CREATE TABLE "crm"."calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"title" text NOT NULL,
	"notes" text,
	"career_exam_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_events_title_check" CHECK (length(title) BETWEEN 1 AND 120),
	CONSTRAINT "calendar_events_notes_check" CHECK (notes IS NULL OR length(notes) <= 2000),
	CONSTRAINT "calendar_events_time_check" CHECK (end_time IS NULL OR (start_time IS NOT NULL AND end_time > start_time))
);
--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_career_exam_id_fkey" FOREIGN KEY ("career_exam_id") REFERENCES "crm"."career_exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_calendar_events_user_date" ON "crm"."calendar_events" USING btree ("user_id","date");