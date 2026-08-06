-- #89 follow-up (Advisor lints 0026/0027): the browser is entirely on Drizzle and
-- PostgREST is closed (#92), so anon/authenticated must hold no privilege on any
-- application table. Reverses the transitional grants from 0002 plus the
-- Supabase-default public grants. REVOKE is idempotent, so a rebuilt-from-baseline
-- database that never had a given grant just no-ops.
REVOKE ALL ON ALL TABLES IN SCHEMA public, catalog, quiz, internal FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public, catalog, quiz, internal FROM anon, authenticated;--> statement-breakpoint
REVOKE USAGE ON SCHEMA catalog, quiz FROM anon, authenticated;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog, quiz REVOKE ALL ON TABLES FROM anon, authenticated;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog, quiz REVOKE ALL ON SEQUENCES FROM anon, authenticated;
