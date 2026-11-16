-- The fuzzy match reads unstemmed words: on stems, `operativo` becomes `oper` and one edit away from `per`.
SET LOCAL lock_timeout = '5s';
--> statement-breakpoint
DROP INDEX catalog.courses_search_idx;
--> statement-breakpoint
CREATE INDEX courses_search_idx ON catalog.courses
USING paradedb (
	id,
	(name::pdb.simple('stemmer=italian', 'ascii_folding=true')),
	(name::pdb.simple('ascii_folding=true', 'alias=name_words')),
	(code::pdb.literal_normalized)
);
--> statement-breakpoint
DROP INDEX catalog.classes_search_idx;
--> statement-breakpoint
CREATE INDEX classes_search_idx ON catalog.classes
USING paradedb (
	id,
	(name::pdb.simple('stemmer=italian', 'ascii_folding=true')),
	(name::pdb.simple('ascii_folding=true', 'alias=name_words'))
);
