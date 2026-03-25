-- ============================================================
-- Allow authenticated users to create quizzes and quiz_questions
-- The original policies only allowed section admins to insert,
-- but the quiz system creates a quiz per user attempt.
-- ============================================================

-- Users can create quizzes for sections they can access
CREATE POLICY quizzes_insert_user ON public.quizzes
  FOR INSERT WITH CHECK (
    public.can_access_section(section_id)
  );

-- Users can add questions to quizzes in sections they can access
CREATE POLICY quiz_questions_insert_user ON public.quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE id = quiz_id AND public.can_access_section(section_id)
    )
  );

-- Users can delete their own quiz attempts (for cancel flow)
CREATE POLICY quiz_attempts_delete_user ON public.quiz_attempts
  FOR DELETE USING (user_id = auth.uid());

-- Users can delete quiz_questions for orphaned quizzes (no attempts left)
CREATE POLICY quiz_questions_delete_user ON public.quiz_questions
  FOR DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM public.quiz_attempts WHERE quiz_id = quiz_questions.quiz_id
    )
  );

-- Users can delete orphaned quizzes (no attempts left)
CREATE POLICY quizzes_delete_user ON public.quizzes
  FOR DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM public.quiz_attempts WHERE quiz_id = quizzes.id
    )
  );
