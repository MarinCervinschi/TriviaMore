-- Dedicated application role for the Drizzle runtime connection (#89).
--
-- Run ONCE per database, by hand, as a superuser (postgres). This is NOT part of
-- the drizzle migration chain: the role carries a password (a per-environment
-- secret) and is created out of band, so a rebuild-from-zero never sees it.
--
-- Why it exists: the app connects as `postgres` (superuser) today, which can read
-- auth password hashes and vault secrets and drop anything. This role keeps the
-- one power the app genuinely needs — BYPASSRLS, because authorization lives in
-- TypeScript and RLS is deny-all — while granting access only to the four
-- application schemas and nothing in auth, storage or vault.
--
-- After running: set DATABASE_URL to this role in Infisical (per environment) and
-- redeploy. Keep SUPABASE_* (auth/storage over supabase-js) unchanged.

-- 1. The role. Replace the password before running; it must match DATABASE_URL.
CREATE ROLE trivia_app WITH LOGIN PASSWORD '__SET_ME__' BYPASSRLS;

-- 2. Access to the four application schemas, and only those.
GRANT USAGE ON SCHEMA public, catalog, quiz, internal TO trivia_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, catalog, quiz, internal TO trivia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, catalog, quiz, internal TO trivia_app;

-- Future tables/sequences created by migrations (which run as postgres) too.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz, internal
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO trivia_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz, internal
  GRANT USAGE, SELECT ON SEQUENCES TO trivia_app;

-- 3. No grants on auth, storage or vault: the role is blocked from them by the
--    absence of USAGE, so a compromised app cannot read password hashes or secrets.
--    (Auth and Storage go through supabase-js over HTTP, not this connection.)

-- Verify (run as trivia_app): the first two return rows, the third is denied.
--   SELECT count(*) FROM public.profiles;
--   SELECT count(*) FROM internal.content_requests;
--   SELECT count(*) FROM auth.users;   -- ERROR: permission denied for schema auth
