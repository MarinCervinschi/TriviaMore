-- ============================================================
-- RLS performance: merge multiple permissive policies
--
-- When two or more PERMISSIVE policies exist on the same role
-- and action, Postgres evaluates ALL of them and ORs the results.
-- Merging them into a single policy whose USING is the OR of
-- the predicates avoids duplicate evaluation. While we're here
-- we also pin the auth.uid()-based policies to TO authenticated
-- so anon never enters the evaluation path.
-- See https://supabase.com/docs/guides/database/postgres/row-level-security#multiple-permissive-policies
-- ============================================================

-- ────────────────────────────────────────────────
-- public.content_requests — merge SELECT (own + admin)
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS content_requests_select_own ON public.content_requests;
DROP POLICY IF EXISTS content_requests_select_admin ON public.content_requests;
DROP POLICY IF EXISTS content_requests_insert ON public.content_requests;
DROP POLICY IF EXISTS content_requests_update ON public.content_requests;
CREATE POLICY content_requests_select ON public.content_requests
  FOR SELECT TO authenticated USING (
    (SELECT auth.uid()) = user_id
    OR public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM catalog.department_admins
      WHERE user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM catalog.course_maintainers
      WHERE user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY content_requests_insert ON public.content_requests
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY content_requests_update ON public.content_requests
  FOR UPDATE TO authenticated USING (
    public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM catalog.department_admins
      WHERE user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM catalog.course_maintainers
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ────────────────────────────────────────────────
-- quiz.quiz_attempts — merge SELECT (own + admin)
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS quiz_attempts_select_own ON quiz.quiz_attempts;
DROP POLICY IF EXISTS quiz_attempts_select_admin ON quiz.quiz_attempts;
DROP POLICY IF EXISTS quiz_attempts_insert ON quiz.quiz_attempts;
DROP POLICY IF EXISTS quiz_attempts_update ON quiz.quiz_attempts;
CREATE POLICY quiz_attempts_select ON quiz.quiz_attempts
  FOR SELECT TO authenticated USING (
    (SELECT auth.uid()) = user_id
    OR public.is_section_admin(
      (SELECT section_id FROM quiz.quizzes WHERE id = quiz_id)
    )
  );
CREATE POLICY quiz_attempts_insert ON quiz.quiz_attempts
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY quiz_attempts_update ON quiz.quiz_attempts
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- quiz.quizzes — merge DELETE (admin + user)
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS quizzes_delete_admin ON quiz.quizzes;
DROP POLICY IF EXISTS quizzes_delete_user ON quiz.quizzes;
CREATE POLICY quizzes_delete ON quiz.quizzes
  FOR DELETE TO authenticated USING (
    public.is_section_admin(section_id)
    OR NOT EXISTS (SELECT 1 FROM quiz.quiz_attempts WHERE quiz_id = quizzes.id)
  );

-- ────────────────────────────────────────────────
-- public.legal_acceptances — merge SELECT (users + admins)
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_read_own_acceptances" ON public.legal_acceptances;
DROP POLICY IF EXISTS "admins_read_all_acceptances" ON public.legal_acceptances;
CREATE POLICY "legal_acceptances_select" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (
    user_id = (SELECT auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid()))
       IN ('ADMIN', 'SUPERADMIN')
  );

-- ────────────────────────────────────────────────
-- storage.objects (contributions bucket) — merge SELECT
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS storage_contributions_select_own ON storage.objects;
DROP POLICY IF EXISTS storage_contributions_select_admin ON storage.objects;
CREATE POLICY storage_contributions_select ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'contributions'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role IN ('SUPERADMIN', 'ADMIN')
      )
    )
  );
