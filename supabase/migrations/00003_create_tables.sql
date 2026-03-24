-- ============================================================
-- Content hierarchy: departments → courses → classes → sections → questions
-- Entity IDs are TEXT (CUIDs generated client-side)
-- User FKs are UUID → profiles(id)
-- ============================================================

-- departments
CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_departments_position ON public.departments(position);

CREATE TRIGGER set_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- department_admins (junction: user ↔ department)
CREATE TABLE public.department_admins (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_id)
);

-- courses
CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  course_type public.course_type NOT NULL DEFAULT 'BACHELOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, department_id)
);

CREATE INDEX idx_courses_position ON public.courses(position);

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- course_maintainers (junction: user ↔ course)
CREATE TABLE public.course_maintainers (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

-- classes
CREATE TABLE public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  class_year INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, course_id)
);

CREATE INDEX idx_classes_position ON public.classes(position);
CREATE INDEX idx_classes_class_year ON public.classes(class_year);

CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- user_recent_classes (junction: user ↔ class, with visit tracking)
CREATE TABLE public.user_recent_classes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  last_visited TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, class_id)
);

-- user_classes (junction: user ↔ class, saved classes)
CREATE TABLE public.user_classes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, class_id)
);

CREATE TRIGGER set_user_classes_updated_at
  BEFORE UPDATE ON public.user_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- sections
CREATE TABLE public.sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sections_position ON public.sections(position);

CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- section_access (junction: user ↔ section, for private sections)
CREATE TABLE public.section_access (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section_id)
);

-- questions
CREATE TABLE public.questions (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  question_type public.question_type NOT NULL,
  options JSONB,
  correct_answer TEXT[] NOT NULL,
  explanation TEXT,
  difficulty public.difficulty NOT NULL DEFAULT 'MEDIUM',
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_section_id ON public.questions(section_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_question_type ON public.questions(question_type);

CREATE TRIGGER set_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Quiz system: evaluation_modes → quizzes → quiz_questions
--              quiz_attempts → answer_attempts
-- ============================================================

-- evaluation_modes
CREATE TABLE public.evaluation_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  correct_answer_points FLOAT NOT NULL DEFAULT 1.0,
  incorrect_answer_points FLOAT NOT NULL DEFAULT 0.0,
  partial_credit_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_evaluation_modes_updated_at
  BEFORE UPDATE ON public.evaluation_modes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- quizzes
CREATE TABLE public.quizzes (
  id TEXT PRIMARY KEY,
  time_limit INT,
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  evaluation_mode_id TEXT NOT NULL REFERENCES public.evaluation_modes(id) ON DELETE CASCADE,
  quiz_mode public.quiz_mode NOT NULL DEFAULT 'STUDY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_section_id ON public.quizzes(section_id);
CREATE INDEX idx_quizzes_quiz_mode ON public.quizzes(quiz_mode);
CREATE INDEX idx_quizzes_evaluation_mode_id ON public.quizzes(evaluation_mode_id);

-- quiz_questions (junction: quiz ↔ question, ordered)
CREATE TABLE public.quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  "order" INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, question_id)
);

-- quiz_attempts
CREATE TABLE public.quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  time_spent INT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);

-- answer_attempts
CREATE TABLE public.answer_attempts (
  id TEXT PRIMARY KEY,
  quiz_attempt_id TEXT NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer TEXT[] NOT NULL,
  score FLOAT NOT NULL,
  UNIQUE(quiz_attempt_id, question_id)
);

-- ============================================================
-- User data: bookmarks, progress
-- ============================================================

-- bookmarks (junction: user ↔ question)
CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

-- progress (per user, section, quiz_mode)
CREATE TABLE public.progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  quiz_mode public.quiz_mode NOT NULL,
  quizzes_taken INT NOT NULL DEFAULT 0,
  average_score FLOAT,
  best_score FLOAT,
  total_time_spent INT NOT NULL DEFAULT 0,
  improvement_rate FLOAT,
  consistency_score FLOAT,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_id, quiz_mode)
);

CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
