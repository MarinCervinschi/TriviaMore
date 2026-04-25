-- ============================================================
-- Migrate changelogs from DB-backed to static markdown files.
--
-- The changelogs table is replaced by .md files in
-- src/content/changelogs/ (deploy = publication). Per-user read
-- state moves from the broadcast-driven notifications table to
-- a tiny user_changelog_reads table, eliminating the N-rows-per-
-- release insert pattern.
-- ============================================================

-- ─── Drop legacy changelogs table ───
DROP TRIGGER IF EXISTS set_changelogs_updated_at ON public.changelogs;
DROP INDEX IF EXISTS public.idx_changelogs_published;
DROP TABLE IF EXISTS public.changelogs;

-- ─── Per-user read state ───
CREATE TABLE public.user_changelog_reads (
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version  TEXT NOT NULL,
  read_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, version)
);

CREATE INDEX idx_user_changelog_reads_user
  ON public.user_changelog_reads(user_id);

ALTER TABLE public.user_changelog_reads ENABLE ROW LEVEL SECURITY;

-- Users see and write only their own rows
CREATE POLICY "users_read_own_changelog_reads" ON public.user_changelog_reads
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_changelog_reads" ON public.user_changelog_reads
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ─── Drop ANNOUNCEMENT from notification_type enum ───
-- Postgres has no DROP VALUE on enums; rename + recreate + cast.
DELETE FROM public.notifications WHERE type::text = 'ANNOUNCEMENT';

ALTER TYPE public.notification_type RENAME TO notification_type__old;

CREATE TYPE public.notification_type AS ENUM (
  'REQUEST_STATUS_CHANGED',
  'NEW_REQUEST_RECEIVED',
  'REQUEST_NEEDS_REVISION',
  'REQUEST_REVISED',
  'CONTENT_UPDATED',
  'NEW_SECTION_ADDED'
);

ALTER TABLE public.notifications
  ALTER COLUMN type TYPE public.notification_type
  USING type::text::public.notification_type;

DROP TYPE public.notification_type__old;
