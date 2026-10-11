CREATE TYPE "public"."evaluation_type" AS ENUM('GRADED', 'PASS_FAIL', 'NONE');--> statement-breakpoint
ALTER TABLE "catalog"."departments" ADD COLUMN "catalogue_code" text;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD COLUMN "national_code" text;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD COLUMN "degree_class" text;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD COLUMN "teaching_language" text;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD COLUMN "restricted_access" boolean;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD COLUMN "catalogue_url" text;--> statement-breakpoint
ALTER TABLE "catalog"."classes" ADD COLUMN "ssd" text;--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ADD COLUMN "evaluation" "evaluation_type";--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ADD COLUMN "taf" text;--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ADD COLUMN "teaching_period" text;--> statement-breakpoint
ALTER TABLE "catalog"."departments" ADD CONSTRAINT "departments_catalogue_code_key" UNIQUE("catalogue_code");--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_national_code_key" UNIQUE("national_code");