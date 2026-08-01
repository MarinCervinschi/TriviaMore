-- Transitional: supabase-js still reads catalog and quiz through PostgREST until
-- phases #90/#91 land. Phase #89 revokes all of this and replaces it with grants
-- to the dedicated application role.
--
-- Note that RLS is enabled with no policies, so these grants alone return no rows
-- to anon/authenticated. A database rebuilt from this baseline is a valid target
-- schema, not a drop-in replacement for the current production database, whose
-- policies still live outside Drizzle until #89.

GRANT USAGE ON SCHEMA catalog TO anon, authenticated, service_role;--> statement-breakpoint
GRANT USAGE ON SCHEMA quiz TO anon, authenticated, service_role;--> statement-breakpoint

GRANT ALL ON ALL TABLES IN SCHEMA catalog TO anon, authenticated, service_role;--> statement-breakpoint
GRANT ALL ON ALL TABLES IN SCHEMA quiz TO anon, authenticated, service_role;--> statement-breakpoint

ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT ALL ON TABLES TO anon, authenticated, service_role;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA quiz GRANT ALL ON TABLES TO anon, authenticated, service_role;
