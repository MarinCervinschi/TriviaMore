-- ============================================================
-- Migration 00008: Content Contributions & Notifications
-- Users submit structured content (sections, questions) for
-- admin approval. Generic notification system for updates.
-- ============================================================

-- ============================================================
-- 1. Enums
-- ============================================================

CREATE TYPE public.content_request_type AS ENUM (
  'NEW_SECTION',
  'NEW_QUESTIONS',
  'REPORT',
  'FILE_UPLOAD'
);

CREATE TYPE public.content_request_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_REVISION'
);

CREATE TYPE public.notification_type AS ENUM (
  'REQUEST_STATUS_CHANGED',
  'NEW_REQUEST_RECEIVED',
  'REQUEST_NEEDS_REVISION',
  'REQUEST_REVISED',
  'CONTENT_UPDATED',
  'NEW_SECTION_ADDED'
);

-- ============================================================
-- 2. Tables
-- ============================================================

-- Content requests: users submit structured content for approval
CREATE TABLE public.content_requests (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type public.content_request_type NOT NULL,
  status public.content_request_status NOT NULL DEFAULT 'PENDING',
  -- Structured content (section data or questions array)
  submitted_content JSONB NOT NULL,
  -- Target in hierarchy (most specific wins)
  target_department_id TEXT REFERENCES public.departments(id) ON DELETE CASCADE,
  target_course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  target_class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  target_section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  -- Admin handling
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

-- Notifications: generic, reusable notification system
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
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

-- ============================================================
-- 3. RLS Policies
-- ============================================================

-- ---- content_requests ----
ALTER TABLE public.content_requests ENABLE ROW LEVEL SECURITY;

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

-- ---- notifications ----
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
