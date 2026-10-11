CREATE TABLE "crm"."tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"due_date" date NOT NULL,
	"due_time" time,
	"end_time" time,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp with time zone,
	"career_exam_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_title_check" CHECK (length(title) BETWEEN 1 AND 200),
	CONSTRAINT "tasks_notes_check" CHECK (notes IS NULL OR length(notes) <= 2000),
	CONSTRAINT "tasks_end_time_check" CHECK (end_time IS NULL OR (due_time IS NOT NULL AND end_time > due_time)),
	CONSTRAINT "tasks_done_at_check" CHECK (done OR done_at IS NULL)
);
--> statement-breakpoint
ALTER TABLE "crm"."tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD CONSTRAINT "tasks_career_exam_id_fkey" FOREIGN KEY ("career_exam_id") REFERENCES "crm"."career_exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tasks_user_due" ON "crm"."tasks" USING btree ("user_id","due_date");