-- ============================================================
-- RLS performance: wrap auth.uid() in (select auth.uid())
--
-- Postgres re-evaluates auth.uid() per row when it appears
-- directly in a USING / WITH CHECK expression. Wrapping it in
-- a scalar subquery turns it into an InitPlan that runs once
-- per statement.
-- See https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================================

-- ────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- ────────────────────────────────────────────────
-- catalog.classes
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS classes_insert ON catalog.classes;
CREATE POLICY classes_insert ON catalog.classes FOR INSERT
  WITH CHECK (
    public.is_superadmin()
    OR EXISTS (SELECT 1 FROM catalog.course_maintainers WHERE user_id = (SELECT auth.uid()))
  );

-- ────────────────────────────────────────────────
-- public.user_recent_classes
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS user_recent_classes_select ON public.user_recent_classes;
DROP POLICY IF EXISTS user_recent_classes_insert ON public.user_recent_classes;
DROP POLICY IF EXISTS user_recent_classes_update ON public.user_recent_classes;
DROP POLICY IF EXISTS user_recent_classes_delete ON public.user_recent_classes;
CREATE POLICY user_recent_classes_select ON public.user_recent_classes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_recent_classes_insert ON public.user_recent_classes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_recent_classes_update ON public.user_recent_classes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_recent_classes_delete ON public.user_recent_classes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- public.user_classes
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS user_classes_select ON public.user_classes;
DROP POLICY IF EXISTS user_classes_insert ON public.user_classes;
DROP POLICY IF EXISTS user_classes_update ON public.user_classes;
DROP POLICY IF EXISTS user_classes_delete ON public.user_classes;
CREATE POLICY user_classes_select ON public.user_classes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_classes_insert ON public.user_classes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_classes_update ON public.user_classes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_classes_delete ON public.user_classes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- catalog.section_access
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS section_access_select ON catalog.section_access;
CREATE POLICY section_access_select ON catalog.section_access FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_section_admin(section_id));

-- ────────────────────────────────────────────────
-- quiz.quiz_attempts
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS quiz_attempts_select_own ON quiz.quiz_attempts;
DROP POLICY IF EXISTS quiz_attempts_insert ON quiz.quiz_attempts;
DROP POLICY IF EXISTS quiz_attempts_update ON quiz.quiz_attempts;
CREATE POLICY quiz_attempts_select_own ON quiz.quiz_attempts FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY quiz_attempts_insert ON quiz.quiz_attempts FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY quiz_attempts_update ON quiz.quiz_attempts FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- quiz.answer_attempts
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS answer_attempts_select ON quiz.answer_attempts;
DROP POLICY IF EXISTS answer_attempts_insert ON quiz.answer_attempts;
CREATE POLICY answer_attempts_select ON quiz.answer_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz.quiz_attempts qa
    WHERE qa.id = quiz_attempt_id AND qa.user_id = (SELECT auth.uid())
  )
);
CREATE POLICY answer_attempts_insert ON quiz.answer_attempts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz.quiz_attempts qa
    WHERE qa.id = quiz_attempt_id AND qa.user_id = (SELECT auth.uid())
  )
);

-- ────────────────────────────────────────────────
-- public.bookmarks
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS bookmarks_select ON public.bookmarks;
DROP POLICY IF EXISTS bookmarks_insert ON public.bookmarks;
DROP POLICY IF EXISTS bookmarks_delete ON public.bookmarks;
CREATE POLICY bookmarks_select ON public.bookmarks FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY bookmarks_insert ON public.bookmarks FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY bookmarks_delete ON public.bookmarks FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- public.progress
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS progress_select ON public.progress;
DROP POLICY IF EXISTS progress_upsert ON public.progress;
DROP POLICY IF EXISTS progress_update ON public.progress;
CREATE POLICY progress_select ON public.progress FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY progress_upsert ON public.progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY progress_update ON public.progress FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ────────────────────────────────────────────────
-- public.content_requests
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS content_requests_select_own ON public.content_requests;
DROP POLICY IF EXISTS content_requests_select_admin ON public.content_requests;
DROP POLICY IF EXISTS content_requests_insert ON public.content_requests;
DROP POLICY IF EXISTS content_requests_update ON public.content_requests;
CREATE POLICY content_requests_select_own ON public.content_requests FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY content_requests_select_admin ON public.content_requests FOR SELECT USING (
  public.is_superadmin() OR EXISTS (
    SELECT 1 FROM catalog.department_admins
    WHERE user_id = (SELECT auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM catalog.course_maintainers
    WHERE user_id = (SELECT auth.uid())
  )
);
CREATE POLICY content_requests_insert ON public.content_requests FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY content_requests_update ON public.content_requests FOR UPDATE USING (
  public.is_superadmin() OR EXISTS (
    SELECT 1 FROM catalog.department_admins
    WHERE user_id = (SELECT auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM catalog.course_maintainers
    WHERE user_id = (SELECT auth.uid())
  )
);

-- ────────────────────────────────────────────────
-- public.notifications
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS notifications_select ON public.notifications;
DROP POLICY IF EXISTS notifications_update ON public.notifications;
DROP POLICY IF EXISTS notifications_insert ON public.notifications;
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY notifications_insert ON public.notifications FOR INSERT WITH CHECK (
  (SELECT auth.uid()) = user_id
  OR (SELECT current_setting('role', true)) = 'service_role'
);

-- ────────────────────────────────────────────────
-- storage.objects (contributions bucket)
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS storage_contributions_insert ON storage.objects;
DROP POLICY IF EXISTS storage_contributions_select_own ON storage.objects;
DROP POLICY IF EXISTS storage_contributions_select_admin ON storage.objects;
CREATE POLICY storage_contributions_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contributions'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY storage_contributions_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contributions'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY storage_contributions_select_admin ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contributions'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role IN ('SUPERADMIN', 'ADMIN')
    )
  );

-- ────────────────────────────────────────────────
-- public.legal_acceptances
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_read_own_acceptances" ON public.legal_acceptances;
DROP POLICY IF EXISTS "admins_read_all_acceptances" ON public.legal_acceptances;
CREATE POLICY "users_read_own_acceptances" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "admins_read_all_acceptances" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid()))
      IN ('ADMIN', 'SUPERADMIN')
  );

-- ────────────────────────────────────────────────
-- public.user_changelog_reads
-- ────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_read_own_changelog_reads" ON public.user_changelog_reads;
DROP POLICY IF EXISTS "users_insert_own_changelog_reads" ON public.user_changelog_reads;
CREATE POLICY "users_read_own_changelog_reads" ON public.user_changelog_reads
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "users_insert_own_changelog_reads" ON public.user_changelog_reads
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
