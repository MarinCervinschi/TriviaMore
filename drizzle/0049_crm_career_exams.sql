CREATE TYPE "public"."career_exam_status" AS ENUM('PLANNED', 'PASSED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "crm"."career_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"class_id" uuid,
	"plan_code" text,
	"group_code" text,
	"name" text NOT NULL,
	"cfu" integer NOT NULL,
	"class_year" integer,
	"graded" boolean DEFAULT true NOT NULL,
	"status" "career_exam_status" DEFAULT 'PLANNED' NOT NULL,
	"grade" integer,
	"honours" boolean DEFAULT false NOT NULL,
	"exam_date" date,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "career_exams_cfu_check" CHECK (cfu > 0),
	CONSTRAINT "career_exams_grade_check" CHECK (grade IS NULL OR (grade BETWEEN 18 AND 30)),
	CONSTRAINT "career_exams_honours_check" CHECK (NOT honours OR grade = 30)
);
--> statement-breakpoint
ALTER TABLE "crm"."career_exams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ADD COLUMN "curriculum_id" uuid;--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ADD COLUMN "career_settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "crm"."career_exams" ADD CONSTRAINT "career_exams_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "crm"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."career_exams" ADD CONSTRAINT "career_exams_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_career_exams_enrollment" ON "crm"."career_exams" USING btree ("enrollment_id");--> statement-breakpoint
ALTER TABLE "crm"."enrollments" ADD CONSTRAINT "enrollments_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "catalog"."course_curricula"("id") ON DELETE set null ON UPDATE no action;