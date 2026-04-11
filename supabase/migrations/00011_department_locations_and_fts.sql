-- ============================================================
-- Migration: department_locations table + Full-Text Search
--
-- 1. New table for multi-location departments (maps support)
-- 2. FTS tsvector columns on courses and classes
-- 3. RLS policies for department_locations
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. Table: catalog.department_locations
-- ────────────────────────────────────────────────
CREATE TABLE catalog.department_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES catalog.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  campus_location public.campus_location,
  is_primary BOOLEAN DEFAULT false,
  position SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_department_locations_dept ON catalog.department_locations(department_id);

CREATE TRIGGER set_department_locations_updated_at
  BEFORE UPDATE ON catalog.department_locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ────────────────────────────────────────────────
-- 2. Full-Text Search columns + GIN indexes
-- ────────────────────────────────────────────────

-- courses: searchable by name, description, code
ALTER TABLE catalog.courses ADD COLUMN fts TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(code, ''))
  ) STORED;
CREATE INDEX courses_fts_idx ON catalog.courses USING gin(fts);

-- classes: searchable by name, description (code is on course_classes since migration 00009)
ALTER TABLE catalog.classes ADD COLUMN fts TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;
CREATE INDEX classes_fts_idx ON catalog.classes USING gin(fts);

-- ────────────────────────────────────────────────
-- 3. RLS policies for department_locations
-- ────────────────────────────────────────────────
ALTER TABLE catalog.department_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY department_locations_select ON catalog.department_locations
  FOR SELECT USING (true);

CREATE POLICY department_locations_insert ON catalog.department_locations
  FOR INSERT WITH CHECK (public.is_department_admin(department_id));

CREATE POLICY department_locations_update ON catalog.department_locations
  FOR UPDATE USING (public.is_department_admin(department_id));

CREATE POLICY department_locations_delete ON catalog.department_locations
  FOR DELETE USING (public.is_department_admin(department_id));
