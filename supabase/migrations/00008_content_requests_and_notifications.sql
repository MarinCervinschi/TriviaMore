-- ============================================================
-- Migration 00008: Content Requests & Notifications
-- Adds content request system (user-submitted requests for
-- new content, error reports) and a generic, reusable
-- notification system.
-- ============================================================

-- ============================================================
-- 1. Enums
-- ============================================================

CREATE TYPE public.content_request_type AS ENUM (
  'NEW_SECTION',
  'NEW_QUESTIONS',
  'ERROR_REPORT',
  'CONTENT_REQUEST'
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

-- Content requests: users submit requests targeting any hierarchy level
CREATE TABLE public.content_requests (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type public.content_request_type NOT NULL,
  status public.content_request_status NOT NULL DEFAULT 'PENDING',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Polymorphic target: at least one will be non-null
  target_department_id TEXT REFERENCES public.departments(id) ON DELETE CASCADE,
  target_course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  target_class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  target_section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  -- Optional: specific question reference (for ERROR_REPORT)
  question_id TEXT REFERENCES public.questions(id) ON DELETE SET NULL,
  -- Admin handling
  handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_requests_user_id ON public.content_requests(user_id);
CREATE INDEX idx_content_requests_status ON public.content_requests(status);
CREATE INDEX idx_content_requests_department ON public.content_requests(target_department_id) WHERE target_department_id IS NOT NULL;
CREATE INDEX idx_content_requests_course ON public.content_requests(target_course_id) WHERE target_course_id IS NOT NULL;
CREATE INDEX idx_content_requests_class ON public.content_requests(target_class_id) WHERE target_class_id IS NOT NULL;
CREATE INDEX idx_content_requests_section ON public.content_requests(target_section_id) WHERE target_section_id IS NOT NULL;
CREATE INDEX idx_content_requests_created_at ON public.content_requests(created_at DESC);

CREATE TRIGGER set_content_requests_updated_at
  BEFORE UPDATE ON public.content_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Content request comments: threaded conversation between user and admin
CREATE TABLE public.content_request_comments (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES public.content_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_request_comments_request ON public.content_request_comments(request_id);

-- Notifications: generic, reusable notification system
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  -- Polymorphic reference to source entity
  reference_id TEXT,
  reference_type TEXT,
  -- Client-side route for navigation on click
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

-- Helper: check if user is admin for a content request's scope
CREATE OR REPLACE FUNCTION public.is_request_admin(req_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.content_requests cr WHERE cr.id = req_id AND (
        (cr.target_department_id IS NOT NULL AND public.is_department_admin(cr.target_department_id))
        OR (cr.target_course_id IS NOT NULL AND public.is_course_maintainer(cr.target_course_id))
        OR (cr.target_class_id IS NOT NULL AND public.is_class_admin(cr.target_class_id))
        OR (cr.target_section_id IS NOT NULL AND public.is_section_admin(cr.target_section_id))
      )
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---- content_requests ----
ALTER TABLE public.content_requests ENABLE ROW LEVEL SECURITY;

-- Users see their own requests
CREATE POLICY content_requests_select_own ON public.content_requests
  FOR SELECT USING (user_id = auth.uid());

-- Admins see requests in their scope
CREATE POLICY content_requests_select_admin ON public.content_requests
  FOR SELECT USING (
    public.is_superadmin()
    OR (target_department_id IS NOT NULL AND public.is_department_admin(target_department_id))
    OR (target_course_id IS NOT NULL AND public.is_course_maintainer(target_course_id))
    OR (target_class_id IS NOT NULL AND public.is_class_admin(target_class_id))
    OR (target_section_id IS NOT NULL AND public.is_section_admin(target_section_id))
  );

-- Any authenticated user can create a request
CREATE POLICY content_requests_insert ON public.content_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Owner can update their own (revise), admins can update in scope (handle)
CREATE POLICY content_requests_update ON public.content_requests
  FOR UPDATE USING (
    user_id = auth.uid()
    OR public.is_superadmin()
    OR (target_department_id IS NOT NULL AND public.is_department_admin(target_department_id))
    OR (target_course_id IS NOT NULL AND public.is_course_maintainer(target_course_id))
    OR (target_class_id IS NOT NULL AND public.is_class_admin(target_class_id))
    OR (target_section_id IS NOT NULL AND public.is_section_admin(target_section_id))
  );

-- ---- content_request_comments ----
ALTER TABLE public.content_request_comments ENABLE ROW LEVEL SECURITY;

-- Visible to anyone who can see the parent request
CREATE POLICY content_request_comments_select ON public.content_request_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_requests cr
      WHERE cr.id = request_id
        AND (cr.user_id = auth.uid() OR public.is_request_admin(cr.id))
    )
  );

-- Anyone who can see the parent request can comment
CREATE POLICY content_request_comments_insert ON public.content_request_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.content_requests cr
      WHERE cr.id = request_id
        AND (cr.user_id = auth.uid() OR public.is_request_admin(cr.id))
    )
  );

-- ---- notifications ----
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Insert is unrestricted (server-side only via supabaseAdmin / service_role)
CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own (mark read)
CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own
CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
