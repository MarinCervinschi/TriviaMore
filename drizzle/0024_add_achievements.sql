CREATE TYPE "public"."achievement_comparator" AS ENUM('GTE', 'LTE');--> statement-breakpoint
CREATE TYPE "public"."achievement_metric" AS ENUM('QUIZZES_COMPLETED', 'DISTINCT_SECTIONS', 'DISTINCT_CLASSES', 'DISTINCT_DEPARTMENTS', 'PERFECT_QUIZZES', 'HARD_CORRECT', 'EXAM_SIMS_PASSED', 'MAX_SECTION_IMPROVEMENT', 'ACTIVE_WEEKS', 'BEST_DAY_STREAK', 'TOTAL_TIME_MS', 'FLASHCARD_SESSIONS', 'BOOKMARKED_THEN_CORRECT', 'APPROVED_REQUESTS', 'SIGNUP_RANK');--> statement-breakpoint
CREATE TABLE "achievements" (
	"key" text PRIMARY KEY NOT NULL,
	"family" text NOT NULL,
	"tier" smallint DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"metric" "achievement_metric" NOT NULL,
	"comparator" "achievement_comparator" DEFAULT 'GTE' NOT NULL,
	"threshold" double precision NOT NULL,
	"icon" text NOT NULL,
	"accent" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_family_tier_key" UNIQUE("family","tier")
);
--> statement-breakpoint
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_key" text NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metric_value" double precision,
	"pin_position" smallint,
	CONSTRAINT "user_achievements_pkey" PRIMARY KEY("user_id","achievement_key")
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_key_fkey" FOREIGN KEY ("achievement_key") REFERENCES "public"."achievements"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_achievements_position" ON "achievements" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_achievements_pinned" ON "user_achievements" USING btree ("user_id" uuid_ops) WHERE (pin_position IS NOT NULL);