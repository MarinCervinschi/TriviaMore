-- The `crm` schema is new, so two things the DSL cannot express have to follow it.

-- 1. updated_at, as on every other table that carries the column.
CREATE TRIGGER set_enrollments_updated_at BEFORE UPDATE ON crm.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
--> statement-breakpoint

-- 2. Access for the runtime role. `scripts/db/dedicated-role.sql` granted USAGE on
-- the four schemas that existed when it was written, and its ALTER DEFAULT
-- PRIVILEGES is scoped to those same four — so nothing here is inherited. Without
-- this the app fails with "permission denied for schema crm" on any database where
-- it connects as trivia_app, while a local postgres connection works fine.
--
-- Guarded because the role is created out of band and a rebuild-from-zero, which
-- is how the migration chain is verified, never has it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app') THEN
    GRANT USAGE ON SCHEMA crm TO trivia_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA crm TO trivia_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA crm TO trivia_app;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA crm
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO trivia_app;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA crm
      GRANT USAGE, SELECT ON SEQUENCES TO trivia_app;
  END IF;
END
$$;
