-- ============================================================
-- catalog schema: content hierarchy
-- departments > courses > classes > sections > questions
-- + admin/maintainer junction tables
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

-- Add FK from profiles.department_id now that catalog.departments exists
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_department_id_fkey
  FOREIGN KEY (department_id) REFERENCES catalog.departments(id) ON DELETE SET NULL;

CREATE TABLE catalog.department_admins (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES catalog.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_id)
);

CREATE TABLE catalog.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  department_id UUID NOT NULL REFERENCES catalog.departments(id) ON DELETE CASCADE,
  location TEXT,
  cfu INT,
  position INT NOT NULL DEFAULT 0,
  course_type public.course_type NOT NULL DEFAULT 'BACHELOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, department_id)
);

CREATE INDEX idx_courses_position ON catalog.courses(position);

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
  code TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES catalog.courses(id) ON DELETE CASCADE,
  class_year INT NOT NULL,
  cfu INT,
  catalogue_url TEXT,
  curriculum TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, course_id)
);

CREATE INDEX idx_classes_position ON catalog.classes(position);
CREATE INDEX idx_classes_class_year ON catalog.classes(class_year);

CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON catalog.classes
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
