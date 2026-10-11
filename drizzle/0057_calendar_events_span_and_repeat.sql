ALTER TABLE "crm"."calendar_events" DROP CONSTRAINT "calendar_events_time_check";--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD COLUMN "recurrence" text;--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_end_date_check" CHECK (end_date IS NULL OR end_date > date);--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_recurrence_check" CHECK (recurrence IS NULL OR length(recurrence) <= 200);--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_time_check" CHECK (end_time IS NULL OR (start_time IS NOT NULL AND (end_date IS NOT NULL OR end_time > start_time)));