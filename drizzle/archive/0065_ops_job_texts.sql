CREATE TABLE "ops"."job_texts" (
	"job" text PRIMARY KEY NOT NULL,
	"label" text,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_texts_label_check" CHECK (label IS NULL OR length(label) BETWEEN 1 AND 80),
	CONSTRAINT "job_texts_description_check" CHECK (description IS NULL OR length(description) BETWEEN 1 AND 400)
);
--> statement-breakpoint
ALTER TABLE "ops"."job_texts" ENABLE ROW LEVEL SECURITY;