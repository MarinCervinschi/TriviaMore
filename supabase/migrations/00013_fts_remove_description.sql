-- Remove description from full-text search on catalog.courses and catalog.classes.
-- The fts column is a STORED generated column; Postgres does not allow ALTER on the
-- generation expression, so we drop the column (CASCADE removes the GIN index) and
-- recreate both column and index with the new expression.

-- Courses: keep name + code, drop description
ALTER TABLE catalog.courses DROP COLUMN fts CASCADE;
ALTER TABLE catalog.courses ADD COLUMN fts TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(code, ''))
) STORED;
CREATE INDEX courses_fts_idx ON catalog.courses USING gin(fts);

-- Classes: keep only name, drop description
ALTER TABLE catalog.classes DROP COLUMN fts CASCADE;
ALTER TABLE catalog.classes ADD COLUMN fts TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('italian', coalesce(name, ''))
) STORED;
CREATE INDEX classes_fts_idx ON catalog.classes USING gin(fts);
