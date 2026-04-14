-- ============================================================
-- catalog schema: content hierarchy (final state)
-- departments > courses > classes (via course_classes N:M) > sections > questions
-- + admin/maintainer junction tables + department_locations + FTS
-- ============================================================

CREATE TABLE catalog.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  area public.department_area,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_departments_position ON catalog.departments(position);

CREATE TRIGGER set_departments_updated_at
  BEFORE UPDATE ON catalog.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE catalog.department_admins (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES catalog.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_id)
);

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

CREATE TABLE catalog.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  department_id UUID NOT NULL REFERENCES catalog.departments(id) ON DELETE CASCADE,
  location public.campus_location,
  cfu INT,
  position INT NOT NULL DEFAULT 0,
  course_type public.course_type NOT NULL DEFAULT 'BACHELOR',
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(code, ''))
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, department_id)
);

CREATE INDEX idx_courses_position ON catalog.courses(position);
CREATE INDEX courses_fts_idx ON catalog.courses USING gin(fts);

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON catalog.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE catalog.course_maintainers (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES catalog.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE catalog.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cfu INT,
  position INT NOT NULL DEFAULT 0,
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_position ON catalog.classes(position);
CREATE INDEX classes_fts_idx ON catalog.classes USING gin(fts);

CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON catalog.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE catalog.course_classes (
  course_id     UUID NOT NULL REFERENCES catalog.courses(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES catalog.classes(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  class_year    INT NOT NULL,
  mandatory     BOOLEAN NOT NULL DEFAULT false,
  catalogue_url TEXT,
  curriculum    TEXT,
  position      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, class_id),
  UNIQUE(code, course_id)
);

CREATE INDEX idx_course_classes_class ON catalog.course_classes(class_id);

CREATE TRIGGER set_course_classes_updated_at
  BEFORE UPDATE ON catalog.course_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE catalog.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  class_id UUID NOT NULL REFERENCES catalog.classes(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sections_position ON catalog.sections(position);

CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON catalog.sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE catalog.section_access (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES catalog.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section_id)
);

CREATE TABLE catalog.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  question_type public.question_type NOT NULL,
  options JSONB,
  correct_answer TEXT[] NOT NULL,
  explanation TEXT,
  difficulty public.difficulty NOT NULL DEFAULT 'MEDIUM',
  section_id UUID NOT NULL REFERENCES catalog.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_section_id ON catalog.questions(section_id);
CREATE INDEX idx_questions_difficulty ON catalog.questions(difficulty);
CREATE INDEX idx_questions_question_type ON catalog.questions(question_type);

CREATE TRIGGER set_questions_updated_at
  BEFORE UPDATE ON catalog.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
