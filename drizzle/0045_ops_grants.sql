-- The console and its worker connect as the runtime role, which owns nothing in ops or pgboss.
-- It may read and write the queue and the run history, never change either schema.
-- Guarded like the crm grants, because the role is created out of band.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app') THEN
    GRANT USAGE ON SCHEMA ops TO trivia_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ops TO trivia_app;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA ops
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO trivia_app;

    GRANT USAGE ON SCHEMA pgboss TO trivia_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA pgboss TO trivia_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA pgboss TO trivia_app;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgboss TO trivia_app;
  END IF;
END
$$;
