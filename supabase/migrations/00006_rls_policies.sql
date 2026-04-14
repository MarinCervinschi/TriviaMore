-- ============================================================
-- Row-Level Security policies for all tables (final state)
-- ============================================================

-- ────────────────────────────────────────────────
-- Helper functions for permission checks
-- ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPERADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

CREATE OR REPLACE FUNCTION public.is_department_admin(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.is_superadmin() OR EXISTS (
    SELECT 1 FROM catalog.department_admins
    WHERE user_id = auth.uid() AND department_id = dept_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

CREATE OR REPLACE FUNCTION public.is_course_maintainer(crs_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.is_department_admin(
    (SELECT department_id FROM catalog.courses WHERE id = crs_id)
  )
  OR EXISTS (
    SELECT 1 FROM catalog.course_maintainers
    WHERE user_id = auth.uid() AND course_id = crs_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

-- Uses course_classes junction (N:M relationship)
CREATE OR REPLACE FUNCTION public.is_class_admin(cls_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM catalog.course_classes cc
    WHERE cc.class_id = cls_id
      AND public.is_course_maintainer(cc.course_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

CREATE OR REPLACE FUNCTION public.is_section_admin(sec_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.is_class_admin(
    (SELECT class_id FROM catalog.sections WHERE id = sec_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

CREATE OR REPLACE FUNCTION public.can_access_section(sec_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM catalog.sections WHERE id = sec_id AND is_public = true
  )
  OR EXISTS (
    SELECT 1 FROM catalog.section_access
    WHERE user_id = auth.uid() AND section_id = sec_id
  )
  OR public.is_section_admin(sec_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

-- Prevent non-superadmins from changing the role column
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT public.is_superadmin() THEN
      RAISE EXCEPTION 'Only superadmins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, catalog, quiz;

CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ────────────────────────────────────────────────
-- departments
-- ────────────────────────────────────────────────
ALTER TABLE catalog.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY departments_select ON catalog.departments FOR SELECT USING (true);
CREATE POLICY departments_insert ON catalog.departments FOR INSERT WITH CHECK (public.is_superadmin());
CREATE POLICY departments_update ON catalog.departments FOR UPDATE USING (public.is_department_admin(id));
CREATE POLICY departments_delete ON catalog.departments FOR DELETE USING (public.is_superadmin());

-- ────────────────────────────────────────────────
-- department_admins
-- ────────────────────────────────────────────────
ALTER TABLE catalog.department_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY department_admins_select ON catalog.department_admins FOR SELECT USING (true);
CREATE POLICY department_admins_insert ON catalog.department_admins FOR INSERT WITH CHECK (public.is_superadmin());
CREATE POLICY department_admins_delete ON catalog.department_admins FOR DELETE USING (public.is_superadmin());

-- ────────────────────────────────────────────────
-- department_locations
-- ────────────────────────────────────────────────
ALTER TABLE catalog.department_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY department_locations_select ON catalog.department_locations FOR SELECT USING (true);
CREATE POLICY department_locations_insert ON catalog.department_locations FOR INSERT WITH CHECK (public.is_department_admin(department_id));
CREATE POLICY department_locations_update ON catalog.department_locations FOR UPDATE USING (public.is_department_admin(department_id));
CREATE POLICY department_locations_delete ON catalog.department_locations FOR DELETE USING (public.is_department_admin(department_id));

-- ────────────────────────────────────────────────
-- courses
-- ────────────────────────────────────────────────
ALTER TABLE catalog.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_select ON catalog.courses FOR SELECT USING (true);
CREATE POLICY courses_insert ON catalog.courses FOR INSERT WITH CHECK (public.is_department_admin(department_id));
CREATE POLICY courses_update ON catalog.courses FOR UPDATE USING (public.is_department_admin(department_id));
CREATE POLICY courses_delete ON catalog.courses FOR DELETE USING (public.is_department_admin(department_id));

-- ────────────────────────────────────────────────
-- course_maintainers
-- ────────────────────────────────────────────────
ALTER TABLE catalog.course_maintainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_maintainers_select ON catalog.course_maintainers FOR SELECT USING (true);
CREATE POLICY course_maintainers_insert ON catalog.course_maintainers FOR INSERT
  WITH CHECK (public.is_department_admin(
    (SELECT department_id FROM catalog.courses WHERE id = course_id)
  ));
CREATE POLICY course_maintainers_delete ON catalog.course_maintainers FOR DELETE
  USING (public.is_department_admin(
    (SELECT department_id FROM catalog.courses WHERE id = course_id)
  ));

-- ────────────────────────────────────────────────
-- classes
-- ────────────────────────────────────────────────
ALTER TABLE catalog.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY classes_select ON catalog.classes FOR SELECT USING (true);
CREATE POLICY classes_insert ON catalog.classes FOR INSERT
  WITH CHECK (
    public.is_superadmin()
    OR EXISTS (SELECT 1 FROM catalog.course_maintainers WHERE user_id = auth.uid())
  );
CREATE POLICY classes_update ON catalog.classes FOR UPDATE USING (public.is_class_admin(id));
CREATE POLICY classes_delete ON catalog.classes FOR DELETE USING (public.is_class_admin(id));

-- ────────────────────────────────────────────────
-- course_classes
-- ────────────────────────────────────────────────
ALTER TABLE catalog.course_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_classes_select ON catalog.course_classes FOR SELECT USING (true);
CREATE POLICY course_classes_insert ON catalog.course_classes FOR INSERT
  WITH CHECK (public.is_course_maintainer(course_id));
CREATE POLICY course_classes_update ON catalog.course_classes FOR UPDATE
  USING (public.is_course_maintainer(course_id));
CREATE POLICY course_classes_delete ON catalog.course_classes FOR DELETE
  USING (public.is_course_maintainer(course_id));

-- ────────────────────────────────────────────────
-- user_recent_classes
-- ────────────────────────────────────────────────
ALTER TABLE public.user_recent_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_recent_classes_select ON public.user_recent_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_recent_classes_insert ON public.user_recent_classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_recent_classes_update ON public.user_recent_classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_recent_classes_delete ON public.user_recent_classes FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- user_classes
-- ────────────────────────────────────────────────
ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_classes_select ON public.user_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_classes_insert ON public.user_classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_classes_update ON public.user_classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_classes_delete ON public.user_classes FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- sections
-- ────────────────────────────────────────────────
ALTER TABLE catalog.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY sections_select ON catalog.sections FOR SELECT USING (public.can_access_section(id));
CREATE POLICY sections_insert ON catalog.sections FOR INSERT WITH CHECK (public.is_class_admin(class_id));
CREATE POLICY sections_update ON catalog.sections FOR UPDATE USING (public.is_class_admin(class_id));
CREATE POLICY sections_delete ON catalog.sections FOR DELETE USING (public.is_class_admin(class_id));

-- ────────────────────────────────────────────────
-- section_access
-- ────────────────────────────────────────────────
ALTER TABLE catalog.section_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY section_access_select ON catalog.section_access FOR SELECT USING (auth.uid() = user_id OR public.is_section_admin(section_id));
CREATE POLICY section_access_insert ON catalog.section_access FOR INSERT WITH CHECK (public.is_section_admin(section_id));
CREATE POLICY section_access_delete ON catalog.section_access FOR DELETE USING (public.is_section_admin(section_id));

-- ────────────────────────────────────────────────
-- questions
-- ────────────────────────────────────────────────
ALTER TABLE catalog.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY questions_select ON catalog.questions FOR SELECT USING (public.can_access_section(section_id));
CREATE POLICY questions_insert ON catalog.questions FOR INSERT WITH CHECK (public.is_section_admin(section_id));
CREATE POLICY questions_update ON catalog.questions FOR UPDATE USING (public.is_section_admin(section_id));
CREATE POLICY questions_delete ON catalog.questions FOR DELETE USING (public.is_section_admin(section_id));

-- ────────────────────────────────────────────────
-- evaluation_modes
-- ────────────────────────────────────────────────
ALTER TABLE quiz.evaluation_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY evaluation_modes_select ON quiz.evaluation_modes FOR SELECT USING (true);
CREATE POLICY evaluation_modes_insert ON quiz.evaluation_modes FOR INSERT WITH CHECK (public.is_superadmin());
CREATE POLICY evaluation_modes_update ON quiz.evaluation_modes FOR UPDATE USING (public.is_superadmin());
CREATE POLICY evaluation_modes_delete ON quiz.evaluation_modes FOR DELETE USING (public.is_superadmin());

-- ────────────────────────────────────────────────
-- quizzes
-- ────────────────────────────────────────────────
ALTER TABLE quiz.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY quizzes_select ON quiz.quizzes FOR SELECT USING (public.can_access_section(section_id));
CREATE POLICY quizzes_insert ON quiz.quizzes FOR INSERT WITH CHECK (public.can_access_section(section_id));
CREATE POLICY quizzes_delete_admin ON quiz.quizzes FOR DELETE USING (public.is_section_admin(section_id));
CREATE POLICY quizzes_delete_user ON quiz.quizzes FOR DELETE USING (
  NOT EXISTS (SELECT 1 FROM quiz.quiz_attempts WHERE quiz_id = quizzes.id)
);

-- ────────────────────────────────────────────────
-- quiz_questions
-- ────────────────────────────────────────────────
ALTER TABLE quiz.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_questions_select ON quiz.quiz_questions FOR SELECT USING (
  public.can_access_section(
    (SELECT section_id FROM quiz.quizzes WHERE id = quiz_id)
  )
);
CREATE POLICY quiz_questions_insert ON quiz.quiz_questions FOR INSERT WITH CHECK (
  public.can_access_section(
    (SELECT section_id FROM quiz.quizzes WHERE id = quiz_id)
  )
);

-- ────────────────────────────────────────────────
-- quiz_attempts
-- ────────────────────────────────────────────────
ALTER TABLE quiz.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_attempts_select_own ON quiz.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY quiz_attempts_select_admin ON quiz.quiz_attempts FOR SELECT USING (
  public.is_section_admin(
    (SELECT section_id FROM quiz.quizzes WHERE id = quiz_id)
  )
);
CREATE POLICY quiz_attempts_insert ON quiz.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY quiz_attempts_update ON quiz.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- answer_attempts
-- ────────────────────────────────────────────────
ALTER TABLE quiz.answer_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY answer_attempts_select ON quiz.answer_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz.quiz_attempts qa
    WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
  )
);
CREATE POLICY answer_attempts_insert ON quiz.answer_attempts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz.quiz_attempts qa
    WHERE qa.id = quiz_attempt_id AND qa.user_id = auth.uid()
  )
);

-- ────────────────────────────────────────────────
-- bookmarks
-- ────────────────────────────────────────────────
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY bookmarks_select ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY bookmarks_insert ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bookmarks_delete ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- progress
-- ────────────────────────────────────────────────
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY progress_select ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY progress_upsert ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY progress_update ON public.progress FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- content_requests
-- ────────────────────────────────────────────────
ALTER TABLE public.content_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_requests_select_own ON public.content_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY content_requests_select_admin ON public.content_requests FOR SELECT USING (
  public.is_superadmin() OR EXISTS (
    SELECT 1 FROM catalog.department_admins
    WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM catalog.course_maintainers
    WHERE user_id = auth.uid()
  )
);
CREATE POLICY content_requests_insert ON public.content_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY content_requests_update ON public.content_requests FOR UPDATE USING (
  public.is_superadmin() OR EXISTS (
    SELECT 1 FROM catalog.department_admins
    WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM catalog.course_maintainers
    WHERE user_id = auth.uid()
  )
);

-- ────────────────────────────────────────────────
-- notifications
-- ────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notifications_insert ON public.notifications FOR INSERT WITH CHECK (
  auth.uid() = user_id
  OR (SELECT current_setting('role', true)) = 'service_role'
);
