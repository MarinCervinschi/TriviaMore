-- ============================================================
-- Row Level Security: helper functions, triggers, policies
-- ============================================================

-- ============================================================
-- 1. Helper functions (SECURITY DEFINER, STABLE)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPERADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_department_admin(dept_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_superadmin() OR EXISTS (
    SELECT 1 FROM public.department_admins
    WHERE user_id = auth.uid() AND department_id = dept_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_course_maintainer(crs_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_department_admin(
    (SELECT department_id FROM public.courses WHERE id = crs_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.course_maintainers
    WHERE user_id = auth.uid() AND course_id = crs_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_class_admin(cls_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_course_maintainer(
    (SELECT course_id FROM public.classes WHERE id = cls_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_section_admin(sec_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_class_admin(
    (SELECT class_id FROM public.sections WHERE id = sec_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_access_section(sec_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sections WHERE id = sec_id AND is_public = true
  )
  OR (
    auth.uid() IS NOT NULL
    AND (
      public.is_section_admin(sec_id)
      OR EXISTS (
        SELECT 1 FROM public.section_access
        WHERE user_id = auth.uid() AND section_id = sec_id
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================
-- 2. Role escalation protection trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_setting('role') != 'service_role' AND NOT public.is_superadmin() THEN
      RAISE EXCEPTION 'Only superadmins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ============================================================
-- 3. Enable RLS on all tables (profiles already enabled in 00002)
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_maintainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recent_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Performance indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sections_is_public
  ON public.sections(id) WHERE is_public = true;

-- ============================================================
-- 5. Policies — profiles
-- ============================================================

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_select_superadmin ON public.profiles
  FOR SELECT USING (public.is_superadmin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 6. Policies — departments (public read, superadmin write)
-- ============================================================

CREATE POLICY departments_select ON public.departments
  FOR SELECT USING (true);

CREATE POLICY departments_insert ON public.departments
  FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY departments_update ON public.departments
  FOR UPDATE USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY departments_delete ON public.departments
  FOR DELETE USING (public.is_superadmin());

-- ============================================================
-- 7. Policies — department_admins (superadmin manages, users see own)
-- ============================================================

CREATE POLICY department_admins_select ON public.department_admins
  FOR SELECT USING (public.is_superadmin() OR user_id = auth.uid());

CREATE POLICY department_admins_insert ON public.department_admins
  FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY department_admins_delete ON public.department_admins
  FOR DELETE USING (public.is_superadmin());

-- ============================================================
-- 8. Policies — courses (public read, dept admin write)
-- ============================================================

CREATE POLICY courses_select ON public.courses
  FOR SELECT USING (true);

CREATE POLICY courses_insert ON public.courses
  FOR INSERT WITH CHECK (public.is_department_admin(department_id));

CREATE POLICY courses_update ON public.courses
  FOR UPDATE USING (public.is_department_admin(department_id))
  WITH CHECK (public.is_department_admin(department_id));

CREATE POLICY courses_delete ON public.courses
  FOR DELETE USING (public.is_department_admin(department_id));

-- ============================================================
-- 9. Policies — course_maintainers (dept admin manages, users see own)
-- ============================================================

CREATE POLICY course_maintainers_select ON public.course_maintainers
  FOR SELECT USING (
    public.is_superadmin()
    OR user_id = auth.uid()
    OR public.is_department_admin(
      (SELECT department_id FROM public.courses WHERE id = course_id)
    )
  );

CREATE POLICY course_maintainers_insert ON public.course_maintainers
  FOR INSERT WITH CHECK (
    public.is_department_admin(
      (SELECT department_id FROM public.courses WHERE id = course_id)
    )
  );

CREATE POLICY course_maintainers_delete ON public.course_maintainers
  FOR DELETE USING (
    public.is_department_admin(
      (SELECT department_id FROM public.courses WHERE id = course_id)
    )
  );

-- ============================================================
-- 10. Policies — classes (public read, course maintainer write)
-- ============================================================

CREATE POLICY classes_select ON public.classes
  FOR SELECT USING (true);

CREATE POLICY classes_insert ON public.classes
  FOR INSERT WITH CHECK (public.is_course_maintainer(course_id));

CREATE POLICY classes_update ON public.classes
  FOR UPDATE USING (public.is_course_maintainer(course_id))
  WITH CHECK (public.is_course_maintainer(course_id));

CREATE POLICY classes_delete ON public.classes
  FOR DELETE USING (public.is_course_maintainer(course_id));

-- ============================================================
-- 11. Policies — sections (access-controlled read, class admin write)
-- ============================================================

CREATE POLICY sections_select ON public.sections
  FOR SELECT USING (public.can_access_section(id));

CREATE POLICY sections_insert ON public.sections
  FOR INSERT WITH CHECK (public.is_class_admin(class_id));

CREATE POLICY sections_update ON public.sections
  FOR UPDATE USING (public.is_section_admin(id))
  WITH CHECK (public.is_class_admin(class_id));

CREATE POLICY sections_delete ON public.sections
  FOR DELETE USING (public.is_section_admin(id));

-- ============================================================
-- 12. Policies — section_access (section admin manages, users see own)
-- ============================================================

CREATE POLICY section_access_select ON public.section_access
  FOR SELECT USING (user_id = auth.uid() OR public.is_section_admin(section_id));

CREATE POLICY section_access_insert ON public.section_access
  FOR INSERT WITH CHECK (public.is_section_admin(section_id));

CREATE POLICY section_access_delete ON public.section_access
  FOR DELETE USING (public.is_section_admin(section_id));

-- ============================================================
-- 13. Policies — questions (access via section, section admin write)
-- ============================================================

CREATE POLICY questions_select ON public.questions
  FOR SELECT USING (public.can_access_section(section_id));

CREATE POLICY questions_insert ON public.questions
  FOR INSERT WITH CHECK (public.is_section_admin(section_id));

CREATE POLICY questions_update ON public.questions
  FOR UPDATE USING (public.is_section_admin(section_id))
  WITH CHECK (public.is_section_admin(section_id));

CREATE POLICY questions_delete ON public.questions
  FOR DELETE USING (public.is_section_admin(section_id));

-- ============================================================
-- 14. Policies — evaluation_modes (public read, superadmin write)
-- ============================================================

CREATE POLICY evaluation_modes_select ON public.evaluation_modes
  FOR SELECT USING (true);

CREATE POLICY evaluation_modes_insert ON public.evaluation_modes
  FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY evaluation_modes_update ON public.evaluation_modes
  FOR UPDATE USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY evaluation_modes_delete ON public.evaluation_modes
  FOR DELETE USING (public.is_superadmin());

-- ============================================================
-- 15. Policies — quizzes (access via section + user creation)
-- ============================================================

CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT USING (public.can_access_section(section_id));

-- Admin insert
CREATE POLICY quizzes_insert ON public.quizzes
  FOR INSERT WITH CHECK (public.is_section_admin(section_id));

-- User insert (quiz per attempt)
CREATE POLICY quizzes_insert_user ON public.quizzes
  FOR INSERT WITH CHECK (public.can_access_section(section_id));

CREATE POLICY quizzes_update ON public.quizzes
  FOR UPDATE USING (public.is_section_admin(section_id))
  WITH CHECK (public.is_section_admin(section_id));

CREATE POLICY quizzes_delete ON public.quizzes
  FOR DELETE USING (public.is_section_admin(section_id));

-- User delete (orphaned quizzes with no attempts)
CREATE POLICY quizzes_delete_user ON public.quizzes
  FOR DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM public.quiz_attempts WHERE quiz_id = quizzes.id
    )
  );

-- ============================================================
-- 16. Policies — quiz_questions (access via quiz's section + user creation)
-- ============================================================

CREATE POLICY quiz_questions_select ON public.quiz_questions
  FOR SELECT USING (
    public.can_access_section(
      (SELECT section_id FROM public.quizzes WHERE id = quiz_id)
    )
  );

-- Admin insert
CREATE POLICY quiz_questions_insert ON public.quiz_questions
  FOR INSERT WITH CHECK (
    public.is_section_admin(
      (SELECT section_id FROM public.quizzes WHERE id = quiz_id)
    )
  );

-- User insert (quiz per attempt)
CREATE POLICY quiz_questions_insert_user ON public.quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE id = quiz_id AND public.can_access_section(section_id)
    )
  );

CREATE POLICY quiz_questions_update ON public.quiz_questions
  FOR UPDATE USING (
    public.is_section_admin(
      (SELECT section_id FROM public.quizzes WHERE id = quiz_id)
    )
  );

CREATE POLICY quiz_questions_delete ON public.quiz_questions
  FOR DELETE USING (
    public.is_section_admin(
      (SELECT section_id FROM public.quizzes WHERE id = quiz_id)
    )
  );

-- User delete (orphaned quiz_questions with no attempts)
CREATE POLICY quiz_questions_delete_user ON public.quiz_questions
  FOR DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM public.quiz_attempts WHERE quiz_id = quiz_questions.quiz_id
    )
  );

-- ============================================================
-- 17. Policies — user_classes (own rows only)
-- ============================================================

CREATE POLICY user_classes_select ON public.user_classes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_classes_insert ON public.user_classes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_classes_update ON public.user_classes
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_classes_delete ON public.user_classes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 18. Policies — user_recent_classes (own rows only)
-- ============================================================

CREATE POLICY user_recent_classes_select ON public.user_recent_classes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_recent_classes_insert ON public.user_recent_classes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_recent_classes_update ON public.user_recent_classes
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_recent_classes_delete ON public.user_recent_classes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 19. Policies — bookmarks (own rows only)
-- ============================================================

CREATE POLICY bookmarks_select ON public.bookmarks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY bookmarks_insert ON public.bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY bookmarks_delete ON public.bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 20. Policies — quiz_attempts (own + admin read scope)
-- ============================================================

CREATE POLICY quiz_attempts_select ON public.quiz_attempts
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_section_admin(
      (SELECT section_id FROM public.quizzes WHERE id = quiz_id)
    )
  );

CREATE POLICY quiz_attempts_insert ON public.quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY quiz_attempts_update_user ON public.quiz_attempts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY quiz_attempts_delete_user ON public.quiz_attempts
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 21. Policies — answer_attempts (own via parent quiz_attempt + admin scope)
-- ============================================================

CREATE POLICY answer_attempts_select ON public.answer_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
    )
    OR public.is_section_admin(
      (SELECT q.section_id FROM public.quizzes q
       JOIN public.quiz_attempts qa ON qa.quiz_id = q.id
       WHERE qa.id = quiz_attempt_id)
    )
  );

CREATE POLICY answer_attempts_insert ON public.answer_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
    )
  );

CREATE POLICY answer_attempts_delete ON public.answer_attempts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
    )
  );

-- ============================================================
-- 22. Policies — progress (own rows only)
-- ============================================================

CREATE POLICY progress_select ON public.progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY progress_insert ON public.progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY progress_update ON public.progress
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY progress_delete ON public.progress
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 23. Policies — content_requests (own + scoped admin)
-- ============================================================

CREATE POLICY content_requests_select_own ON public.content_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY content_requests_select_admin ON public.content_requests
  FOR SELECT USING (
    public.is_superadmin()
    OR (target_department_id IS NOT NULL AND public.is_department_admin(target_department_id))
    OR (target_course_id IS NOT NULL AND public.is_course_maintainer(target_course_id))
    OR (target_class_id IS NOT NULL AND public.is_class_admin(target_class_id))
    OR (target_section_id IS NOT NULL AND public.is_section_admin(target_section_id))
  );

CREATE POLICY content_requests_insert ON public.content_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY content_requests_update ON public.content_requests
  FOR UPDATE USING (
    user_id = auth.uid()
    OR public.is_superadmin()
    OR (target_department_id IS NOT NULL AND public.is_department_admin(target_department_id))
    OR (target_course_id IS NOT NULL AND public.is_course_maintainer(target_course_id))
    OR (target_class_id IS NOT NULL AND public.is_class_admin(target_class_id))
    OR (target_section_id IS NOT NULL AND public.is_section_admin(target_section_id))
  );

-- ============================================================
-- 24. Policies — notifications (own rows, service_role can insert for others)
-- ============================================================

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR current_setting('role') = 'service_role'
  );

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
