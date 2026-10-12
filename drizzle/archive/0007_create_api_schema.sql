-- PostgREST requires at least one target schema; #92 points it at an empty `api`
-- so nothing is reachable over /rest/v1 or /graphql/v1. The data stays in
-- public/catalog/quiz/internal, reached only through Drizzle.
CREATE SCHEMA IF NOT EXISTS "api";
