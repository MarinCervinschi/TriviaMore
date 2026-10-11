CREATE SCHEMA "ops";
--> statement-breakpoint
CREATE TYPE "public"."job_run_status" AS ENUM('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."job_run_trigger" AS ENUM('MANUAL', 'SCHEDULE');--> statement-breakpoint
CREATE TABLE "ops"."job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job" text NOT NULL,
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dry_run" boolean DEFAULT false NOT NULL,
	"status" "job_run_status" DEFAULT 'QUEUED' NOT NULL,
	"trigger" "job_run_trigger" DEFAULT 'MANUAL' NOT NULL,
	"requested_by" uuid,
	"queue_job_id" uuid,
	"summary" jsonb,
	"error" text,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ops"."job_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_job_runs_job_queued_at" ON "ops"."job_runs" USING btree ("job","queued_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "idx_job_runs_active" ON "ops"."job_runs" USING btree ("status") WHERE status in ('QUEUED', 'RUNNING');