-- ============================================================
-- quiz schema: evaluation, quizzes, attempts, answers
-- ============================================================

CREATE TABLE quiz.evaluation_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  correct_answer_points FLOAT NOT NULL DEFAULT 1.0,
  incorrect_answer_points FLOAT NOT NULL DEFAULT 0.0,
  partial_credit_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_evaluation_modes_updated_at
  BEFORE UPDATE ON quiz.evaluation_modes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE quiz.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_limit INT,
  section_id UUID NOT NULL REFERENCES catalog.sections(id) ON DELETE CASCADE,
  evaluation_mode_id UUID NOT NULL REFERENCES quiz.evaluation_modes(id) ON DELETE CASCADE,
  quiz_mode public.quiz_mode NOT NULL DEFAULT 'STUDY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_section_id ON quiz.quizzes(section_id);
CREATE INDEX idx_quizzes_quiz_mode ON quiz.quizzes(quiz_mode);
CREATE INDEX idx_quizzes_evaluation_mode_id ON quiz.quizzes(evaluation_mode_id);

CREATE TABLE quiz.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quiz.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES catalog.questions(id) ON DELETE CASCADE,
  "order" INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, question_id)
);

CREATE TABLE quiz.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quiz.quizzes(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  time_spent INT,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz.quiz_attempts(completed_at);

CREATE TABLE quiz.answer_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID NOT NULL REFERENCES quiz.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES catalog.questions(id) ON DELETE CASCADE,
  user_answer TEXT[] NOT NULL,
  score FLOAT NOT NULL,
  UNIQUE(quiz_attempt_id, question_id)
);
