CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE SCHEMA "quiz";
--> statement-breakpoint
CREATE TYPE "public"."content_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');--> statement-breakpoint
CREATE TYPE "public"."content_request_type" AS ENUM('NEW_SECTION', 'NEW_QUESTIONS', 'REPORT', 'FILE_UPLOAD');--> statement-breakpoint
CREATE TYPE "public"."legal_document_type" AS ENUM('TERMS', 'PRIVACY');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('REQUEST_STATUS_CHANGED', 'NEW_REQUEST_RECEIVED', 'REQUEST_NEEDS_REVISION', 'REQUEST_REVISED', 'CONTENT_UPDATED', 'NEW_SECTION_ADDED', 'MAINTAINER_ASSIGNED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPERADMIN', 'ADMIN', 'MAINTAINER', 'STUDENT');--> statement-breakpoint
CREATE TYPE "public"."campus_location" AS ENUM('MODENA', 'REGGIO_EMILIA', 'CARPI', 'MANTOVA');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('BACHELOR', 'MASTER', 'SINGLE_CYCLE');--> statement-breakpoint
CREATE TYPE "public"."department_area" AS ENUM('SCIENZE', 'TECNOLOGIA', 'SALUTE', 'VITA', 'SOCIETA_CULTURA');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');--> statement-breakpoint
CREATE TYPE "public"."quiz_mode" AS ENUM('STUDY', 'EXAM_SIMULATION');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	"role" "role" DEFAULT 'STUDENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"reference_id" text,
	"reference_type" text,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "content_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_type" "content_request_type" NOT NULL,
	"status" "content_request_status" DEFAULT 'PENDING' NOT NULL,
	"submitted_content" jsonb NOT NULL,
	"target_department_id" uuid,
	"target_course_id" uuid,
	"target_class_id" uuid,
	"target_section_id" uuid,
	"handled_by" uuid,
	"handled_at" timestamp with time zone,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "legal_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_type" "legal_document_type" NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" "inet",
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "legal_acceptances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_pkey" PRIMARY KEY("user_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"quiz_mode" "quiz_mode" NOT NULL,
	"quizzes_taken" integer DEFAULT 0 NOT NULL,
	"average_score" double precision,
	"best_score" double precision,
	"total_time_spent" integer DEFAULT 0 NOT NULL,
	"improvement_rate" double precision,
	"consistency_score" double precision,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progress_user_id_section_id_quiz_mode_key" UNIQUE("user_id","section_id","quiz_mode")
);
--> statement-breakpoint
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_classes" (
	"user_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_classes_pkey" PRIMARY KEY("user_id","class_id")
);
--> statement-breakpoint
ALTER TABLE "user_classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_recent_classes" (
	"user_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"last_visited" timestamp with time zone DEFAULT now() NOT NULL,
	"visit_count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "user_recent_classes_pkey" PRIMARY KEY("user_id","class_id")
);
--> statement-breakpoint
ALTER TABLE "user_recent_classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_changelog_reads" (
	"user_id" uuid NOT NULL,
	"version" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_changelog_reads_pkey" PRIMARY KEY("user_id","version")
);
--> statement-breakpoint
ALTER TABLE "user_changelog_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"area" "department_area",
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "catalog"."departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."department_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"campus_location" "campus_location",
	"is_primary" boolean DEFAULT false,
	"position" smallint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."department_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."department_admins" (
	"user_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_admins_pkey" PRIMARY KEY("user_id","department_id")
);
--> statement-breakpoint
ALTER TABLE "catalog"."department_admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"department_id" uuid NOT NULL,
	"location" "campus_location",
	"cfu" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"course_type" "course_type" DEFAULT 'BACHELOR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fts" "tsvector" GENERATED ALWAYS AS (to_tsvector('italian'::regconfig, ((COALESCE(name, ''::text) || ' '::text) || COALESCE(code, ''::text)))) STORED,
	CONSTRAINT "courses_code_department_id_key" UNIQUE("code","department_id")
);
--> statement-breakpoint
ALTER TABLE "catalog"."courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."course_maintainers" (
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_maintainers_pkey" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "catalog"."course_maintainers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cfu" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fts" "tsvector" GENERATED ALWAYS AS (to_tsvector('italian'::regconfig, COALESCE(name, ''::text))) STORED
);
--> statement-breakpoint
ALTER TABLE "catalog"."classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."course_classes" (
	"course_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"code" text NOT NULL,
	"class_year" integer NOT NULL,
	"mandatory" boolean DEFAULT false NOT NULL,
	"catalogue_url" text,
	"curriculum" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_classes_pkey" PRIMARY KEY("course_id","class_id"),
	CONSTRAINT "course_classes_code_course_id_key" UNIQUE("code","course_id")
);
--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"class_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text GENERATED ALWAYS AS (lower(replace(name, ' '::text, '-'::text))) STORED
);
--> statement-breakpoint
ALTER TABLE "catalog"."sections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."section_access" (
	"user_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "section_access_pkey" PRIMARY KEY("user_id","section_id")
);
--> statement-breakpoint
ALTER TABLE "catalog"."section_access" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog"."questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"options" text[],
	"correct_answer" text[] NOT NULL,
	"explanation" text,
	"difficulty" "difficulty" DEFAULT 'MEDIUM' NOT NULL,
	"section_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_options_shape_check" CHECK (((question_type = 'SHORT_ANSWER'::question_type) AND (options IS NULL)) OR ((question_type = 'TRUE_FALSE'::question_type) AND (options = ARRAY['Vero'::text, 'Falso'::text])) OR ((question_type = 'MULTIPLE_CHOICE'::question_type) AND ((array_length(options, 1) >= 2) AND (array_length(options, 1) <= 40))))
);
--> statement-breakpoint
ALTER TABLE "catalog"."questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz"."evaluation_modes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"correct_answer_points" double precision DEFAULT 1 NOT NULL,
	"incorrect_answer_points" double precision DEFAULT 0 NOT NULL,
	"partial_credit_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluation_modes_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "quiz"."evaluation_modes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz"."quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time_limit" integer,
	"section_id" uuid NOT NULL,
	"evaluation_mode_id" uuid NOT NULL,
	"quiz_mode" "quiz_mode" DEFAULT 'STUDY' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz"."quizzes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz"."quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_questions_quiz_id_question_id_key" UNIQUE("quiz_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "quiz"."quiz_questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz"."quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quiz_id" uuid NOT NULL,
	"score" double precision NOT NULL,
	"time_spent" integer,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz"."answer_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text[] NOT NULL,
	"score" double precision NOT NULL,
	CONSTRAINT "answer_attempts_quiz_attempt_id_question_id_key" UNIQUE("quiz_attempt_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_target_class_id_fkey" FOREIGN KEY ("target_class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_target_course_id_fkey" FOREIGN KEY ("target_course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_target_department_id_fkey" FOREIGN KEY ("target_department_id") REFERENCES "catalog"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_target_section_id_fkey" FOREIGN KEY ("target_section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "catalog"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_classes" ADD CONSTRAINT "user_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_classes" ADD CONSTRAINT "user_classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_classes" ADD CONSTRAINT "user_classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recent_classes" ADD CONSTRAINT "user_recent_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recent_classes" ADD CONSTRAINT "user_recent_classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recent_classes" ADD CONSTRAINT "user_recent_classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_changelog_reads" ADD CONSTRAINT "user_changelog_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."department_locations" ADD CONSTRAINT "department_locations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "catalog"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."department_admins" ADD CONSTRAINT "department_admins_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "catalog"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."department_admins" ADD CONSTRAINT "department_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "catalog"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_maintainers" ADD CONSTRAINT "course_maintainers_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_maintainers" ADD CONSTRAINT "course_maintainers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ADD CONSTRAINT "course_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."course_classes" ADD CONSTRAINT "course_classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "catalog"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."sections" ADD CONSTRAINT "sections_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "catalog"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."section_access" ADD CONSTRAINT "section_access_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."section_access" ADD CONSTRAINT "section_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."questions" ADD CONSTRAINT "questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quizzes" ADD CONSTRAINT "quizzes_evaluation_mode_id_fkey" FOREIGN KEY ("evaluation_mode_id") REFERENCES "quiz"."evaluation_modes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quizzes" ADD CONSTRAINT "quizzes_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "catalog"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD CONSTRAINT "answer_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "catalog"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz"."answer_attempts" ADD CONSTRAINT "answer_attempts_quiz_attempt_id_fkey" FOREIGN KEY ("quiz_attempt_id") REFERENCES "quiz"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profiles_role" ON "profiles" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("user_id" uuid_ops) WHERE (is_read = false);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_content_requests_created_at" ON "content_requests" USING btree ("created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "idx_content_requests_status" ON "content_requests" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_content_requests_user_id" ON "content_requests" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_legal_acceptances_lookup" ON "legal_acceptances" USING btree ("user_id" uuid_ops,"document_type" enum_ops,"version" text_ops);--> statement-breakpoint
CREATE INDEX "idx_legal_acceptances_user" ON "legal_acceptances" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_user_changelog_reads_user" ON "user_changelog_reads" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_departments_position" ON "catalog"."departments" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_department_locations_dept" ON "catalog"."department_locations" USING btree ("department_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "courses_fts_idx" ON "catalog"."courses" USING gin ("fts" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_courses_position" ON "catalog"."courses" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE INDEX "classes_fts_idx" ON "catalog"."classes" USING gin ("fts" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_classes_position" ON "catalog"."classes" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_course_classes_class" ON "catalog"."course_classes" USING btree ("class_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_sections_position" ON "catalog"."sections" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sections_class_id_slug_key" ON "catalog"."sections" USING btree ("class_id" uuid_ops,"slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_questions_difficulty" ON "catalog"."questions" USING btree ("difficulty" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_questions_question_type" ON "catalog"."questions" USING btree ("question_type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_questions_section_id" ON "catalog"."questions" USING btree ("section_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quizzes_evaluation_mode_id" ON "quiz"."quizzes" USING btree ("evaluation_mode_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quizzes_quiz_mode" ON "quiz"."quizzes" USING btree ("quiz_mode" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_quizzes_section_id" ON "quiz"."quizzes" USING btree ("section_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_completed_at" ON "quiz"."quiz_attempts" USING btree ("completed_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_quiz_id" ON "quiz"."quiz_attempts" USING btree ("quiz_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_user_id" ON "quiz"."quiz_attempts" USING btree ("user_id" uuid_ops);