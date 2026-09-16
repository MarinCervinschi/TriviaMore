CREATE TABLE "user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"quizzes_completed" integer DEFAULT 0 NOT NULL,
	"perfect_quizzes" integer DEFAULT 0 NOT NULL,
	"exam_sims_passed" integer DEFAULT 0 NOT NULL,
	"flashcard_sessions" integer DEFAULT 0 NOT NULL,
	"approved_requests" integer DEFAULT 0 NOT NULL,
	"total_time_ms" bigint DEFAULT 0 NOT NULL,
	"hard_correct" integer DEFAULT 0 NOT NULL,
	"bookmarked_then_correct" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_section_stats" (
	"user_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"first_score" double precision,
	"last_score" double precision,
	"first_at" timestamp with time zone,
	"last_at" timestamp with time zone,
	CONSTRAINT "user_section_stats_pkey" PRIMARY KEY("user_id","section_id")
);
--> statement-breakpoint
ALTER TABLE "user_section_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_question_stats" (
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"hard_correct" boolean DEFAULT false NOT NULL,
	"bookmarked_then_correct" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_question_stats_pkey" PRIMARY KEY("user_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "user_question_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_day_activity" (
	"user_id" uuid NOT NULL,
	"day" date NOT NULL,
	"quizzes" integer DEFAULT 0 NOT NULL,
	"flashcards" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_day_activity_pkey" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
ALTER TABLE "user_day_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "signup_rank" integer;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_section_stats" ADD CONSTRAINT "user_section_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_section_stats" ADD CONSTRAINT "user_section_stats_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "catalog"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_stats" ADD CONSTRAINT "user_question_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_stats" ADD CONSTRAINT "user_question_stats_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "catalog"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_day_activity" ADD CONSTRAINT "user_day_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;