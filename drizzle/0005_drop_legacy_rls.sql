-- Phase #89 cleanup: remove the RLS artifacts the service-role Drizzle app never
-- touches. Everything is IF EXISTS because these objects live in the frozen
-- supabase archive, not in the Drizzle baseline — on a rebuilt database they were
-- never created, so each statement is a no-op there and only bites on the live one.
-- Order matters: the policies reference the helper functions, so policies drop first.

DROP VIEW IF EXISTS public.bookmarks_detail;--> statement-breakpoint
DROP VIEW IF EXISTS public.progress_detail;--> statement-breakpoint
DROP VIEW IF EXISTS public.user_classes_detail;--> statement-breakpoint
DROP VIEW IF EXISTS public.user_recent_classes_detail;--> statement-breakpoint
DROP VIEW IF EXISTS quiz.quiz_attempts_detail;--> statement-breakpoint
DROP VIEW IF EXISTS quiz.quizzes_detail;--> statement-breakpoint

-- Deny-all is the target: every table keeps RLS enabled with no policy. A loop,
-- not 76 lines, so drift on the live database cannot leave one behind.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname IN ('public', 'catalog', 'quiz')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;--> statement-breakpoint

DROP FUNCTION IF EXISTS public.can_access_section(sec_id uuid);--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_class_admin(cls_id uuid);--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_course_maintainer(crs_id uuid);--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_department_admin(dept_id uuid);--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_section_admin(sec_id uuid);--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_superadmin();--> statement-breakpoint

-- The trigger functions stay (they run on triggers), but nothing may call them directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;
