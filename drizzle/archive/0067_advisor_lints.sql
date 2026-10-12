-- Supabase's default privileges on public granted anon and authenticated every table created after 0008.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;--> statement-breakpoint
ALTER FUNCTION pgboss.job_now() SET search_path = pgboss, pg_catalog;--> statement-breakpoint
ALTER FUNCTION pgboss.job_table_format(text, text) SET search_path = pgboss, pg_catalog;--> statement-breakpoint
ALTER FUNCTION pgboss.job_table_run(text, text, text) SET search_path = pgboss, pg_catalog;--> statement-breakpoint
ALTER FUNCTION pgboss.job_table_run_async(text, int, text, text, text) SET search_path = pgboss, pg_catalog;--> statement-breakpoint
ALTER FUNCTION pgboss.create_queue(text, jsonb) SET search_path = pgboss, pg_catalog;--> statement-breakpoint
ALTER FUNCTION pgboss.delete_queue(text) SET search_path = pgboss, pg_catalog;
