CREATE TABLE "crm"."exam_sittings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_exam_id" uuid NOT NULL,
	"date" date NOT NULL,
	"label" text,
	"chosen" boolean DEFAULT false NOT NULL,
	"importance" smallint DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_sittings_importance_check" CHECK (importance BETWEEN 1 AND 3),
	CONSTRAINT "exam_sittings_label_check" CHECK (label IS NULL OR length(label) <= 40)
);
--> statement-breakpoint
ALTER TABLE "crm"."exam_sittings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crm"."exam_sittings" ADD CONSTRAINT "exam_sittings_career_exam_id_fkey" FOREIGN KEY ("career_exam_id") REFERENCES "crm"."career_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_exam_sittings_exam_date" ON "crm"."exam_sittings" USING btree ("career_exam_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_sittings_one_chosen" ON "crm"."exam_sittings" USING btree ("career_exam_id") WHERE chosen;