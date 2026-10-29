CREATE TABLE "ops"."job_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job" text NOT NULL,
	"cron" text NOT NULL,
	"timezone" text DEFAULT 'Europe/Rome' NOT NULL,
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dry_run" boolean DEFAULT true NOT NULL,
	"paused" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ops"."job_schedules" ENABLE ROW LEVEL SECURITY;