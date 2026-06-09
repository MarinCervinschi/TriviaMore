-- Add a derived, unique slug to catalog.sections.
-- Browse URLs (/browse/.../$section) previously resolved a section by reversing
-- its name slug (all hyphens -> spaces), which 404'd any section whose name
-- itself contained hyphens (e.g. "Host-to-Network"). A stored slug column lets
-- the route resolve by exact match instead of a lossy reverse.

BEGIN;

-- Same transform the app used to build the slug: lowercase, spaces -> hyphens.
-- Generated + stored so it stays in sync with name and is populated automatically
-- on every insert (admin UI and manual SQL seeding alike).
ALTER TABLE catalog.sections
  ADD COLUMN slug TEXT
  GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED;

-- Slugs are scoped to the parent class: routes resolve a section within a class,
-- so two different classes may each have e.g. an "introduzione" section.
CREATE UNIQUE INDEX sections_class_id_slug_key
  ON catalog.sections (class_id, slug);

COMMIT;
