CREATE TABLE "catalog"."course_curricula" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"cohort" integer NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"common" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_curricula_course_id_cohort_code_key" UNIQUE("course_id","cohort","code")
);
--> statement-breakpoint
ALTER TABLE "catalog"."course_curricula" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."course_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"cohort" integer NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"code" text NOT NULL,
	"class_id" uuid,
	"name" text NOT NULL,
	"cfu" integer,
	"class_year" integer NOT NULL,
	"mandatory" boolean DEFAULT false NOT NULL,
	"evaluation" "evaluation_type",
	"taf" text,
	"teaching_period" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_plans_curriculum_id_code_key" UNIQUE("curriculum_id","code")
);
--> statement-breakpoint
ALTER TABLE "catalog"."course_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "catalog"."course_curricula" ADD CONSTRAINT "course_curricula_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_plans" ADD CONSTRAINT "course_plans_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_plans" ADD CONSTRAINT "course_plans_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "catalog"."course_curricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_plans" ADD CONSTRAINT "course_plans_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_course_plans_course_cohort" ON "catalog"."course_plans" USING btree ("course_id" uuid_ops,"cohort" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_course_plans_class" ON "catalog"."course_plans" USING btree ("class_id" uuid_ops);