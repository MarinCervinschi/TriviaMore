SET LOCAL lock_timeout = '5s';--> statement-breakpoint
DROP INDEX "catalog"."courses_fts_idx";--> statement-breakpoint
DROP INDEX "catalog"."classes_fts_idx";--> statement-breakpoint
ALTER TABLE "catalog"."courses" DROP COLUMN "fts";--> statement-breakpoint
ALTER TABLE "catalog"."classes" DROP COLUMN "fts";