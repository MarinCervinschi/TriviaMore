ALTER TABLE "crm"."calendar_events" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "crm"."calendar_events" ADD CONSTRAINT "calendar_events_color_check" CHECK (color IS NULL OR color IN ('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'));--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD CONSTRAINT "tasks_color_check" CHECK (color IS NULL OR color IN ('chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'));