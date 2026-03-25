-- Allow users to update their own quiz attempts (for completing quizzes)
CREATE POLICY quiz_attempts_update_user ON public.quiz_attempts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
