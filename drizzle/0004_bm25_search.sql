-- drizzle-kit knows neither pg_search nor its index type; src/lib/browse/service/search.ts is the only reader.
SET LOCAL lock_timeout = '5s';
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_search;
--> statement-breakpoint
CREATE INDEX courses_search_idx ON catalog.courses
USING paradedb (
	id,
	(name::pdb.simple('stemmer=italian', 'ascii_folding=true')),
	(code::pdb.literal_normalized)
);
--> statement-breakpoint
CREATE INDEX classes_search_idx ON catalog.classes
USING paradedb (
	id,
	(name::pdb.simple('stemmer=italian', 'ascii_folding=true'))
);
