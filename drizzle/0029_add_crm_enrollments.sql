CREATE SCHEMA "crm";
--> statement-breakpoint
CREATE TABLE "crm"."enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"curriculum" text,
	"start_year" integer,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_enrollments_user" ON "crm"."enrollments" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_user_id_current_key" ON "crm"."enrollments" USING btree ("user_id" uuid_ops) WHERE is_current;