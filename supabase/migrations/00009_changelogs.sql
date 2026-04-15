-- ============================================================
-- Changelogs table + ANNOUNCEMENT notification type
-- ============================================================

-- Extend notification_type enum for broadcast announcements
ALTER TYPE public.notification_type ADD VALUE 'ANNOUNCEMENT';

-- Changelogs table for release notes / news
CREATE TABLE public.changelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'new'
    CHECK (category IN ('new', 'improved', 'fixed')),
  is_draft BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup for the public /news page (only published entries)
CREATE INDEX idx_changelogs_published ON public.changelogs(published_at DESC)
  WHERE is_draft = false;

-- Auto-update updated_at on row change
CREATE TRIGGER set_changelogs_updated_at
  BEFORE UPDATE ON public.changelogs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── RLS ───
ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;

-- Public can read published entries (guests + authenticated)
CREATE POLICY changelogs_select_published ON public.changelogs
  FOR SELECT USING (is_draft = false);

-- All write operations go through supabaseAdmin (service_role bypasses RLS).
-- Draft reads also use supabaseAdmin in admin server functions.
-- No INSERT/UPDATE/DELETE policies needed.
