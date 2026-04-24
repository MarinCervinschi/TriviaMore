-- ============================================================
-- Legal acceptance audit log
--
-- Tracks every acceptance of Terms of Service and Privacy Policy
-- by registered users, including the document version that was
-- accepted, the timestamp, the client IP address, and the user
-- agent. Used both at registration (via trigger) and when a
-- returning user re-accepts after a version bump or a v2.0
-- migration.
-- ============================================================

CREATE TYPE public.legal_document_type AS ENUM ('TERMS', 'PRIVACY');

CREATE TABLE public.legal_acceptances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type public.legal_document_type NOT NULL,
  version       TEXT NOT NULL,
  accepted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address    INET,
  user_agent    TEXT
);

CREATE INDEX idx_legal_acceptances_user ON public.legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_lookup
  ON public.legal_acceptances(user_id, document_type, version);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can read their own acceptance history
CREATE POLICY "users_read_own_acceptances" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins can read all acceptance rows (for audit / support).
-- MAINTAINER is content-scoped and excluded from the legal audit log.
CREATE POLICY "admins_read_all_acceptances" ON public.legal_acceptances
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
      IN ('ADMIN', 'SUPERADMIN')
  );

-- No INSERT/UPDATE/DELETE policies: writes happen only via server
-- functions using the service role, and rows are immutable once created.
