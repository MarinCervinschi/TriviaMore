SET lock_timeout = '5s';
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "anonymized_at" timestamp with time zone;