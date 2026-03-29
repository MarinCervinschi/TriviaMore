-- ============================================================
-- public schema: user data, contributions, notifications
-- ============================================================

CREATE TABLE public.user_recent_classes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES catalog.classes(id) ON DELETE CASCADE,
  last_visited TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, class_id)
);

CREATE TABLE public.user_classes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES catalog.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, class_id)
);

CREATE TRIGGER set_user_classes_updated_at
  BEFORE UPDATE ON public.user_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES catalog.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES catalog.sections(id) ON DELETE CASCADE,
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

CREATE TABLE public.content_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type public.content_request_type NOT NULL,
  status public.content_request_status NOT NULL DEFAULT 'PENDING',
  submitted_content JSONB NOT NULL,
  target_department_id UUID REFERENCES catalog.departments(id) ON DELETE CASCADE,
  target_course_id UUID REFERENCES catalog.courses(id) ON DELETE CASCADE,
  target_class_id UUID REFERENCES catalog.classes(id) ON DELETE CASCADE,
  target_section_id UUID REFERENCES catalog.sections(id) ON DELETE CASCADE,
  handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_requests_user_id ON public.content_requests(user_id);
CREATE INDEX idx_content_requests_status ON public.content_requests(status);
CREATE INDEX idx_content_requests_created_at ON public.content_requests(created_at DESC);

CREATE TRIGGER set_content_requests_updated_at
  BEFORE UPDATE ON public.content_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  reference_id TEXT,
  reference_type TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
