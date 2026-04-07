-- ============================================================
-- Migration: Many-to-Many relationship between courses and classes
--
-- classes.course_id (1:N) → course_classes junction (N:M)
-- Per-course metadata (code, year, mandatory, etc.)
-- moves to the junction table.
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. Create junction table
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- 2. Populate junction from existing data
-- ────────────────────────────────────────────────
INSERT INTO catalog.course_classes (course_id, class_id, code, class_year, catalogue_url, curriculum, position)
SELECT course_id, id, code, class_year, catalogue_url, curriculum, position
FROM catalog.classes;

-- ────────────────────────────────────────────────
-- 3. Add course_id to user tables (navigation context)
-- ────────────────────────────────────────────────
ALTER TABLE public.user_classes
  ADD COLUMN course_id UUID REFERENCES catalog.courses(id) ON DELETE CASCADE;
UPDATE public.user_classes uc
  SET course_id = c.course_id
  FROM catalog.classes c WHERE c.id = uc.class_id;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.user_classes WHERE course_id IS NULL) THEN
    RAISE EXCEPTION 'user_classes has rows with NULL course_id after backfill';
  END IF;
END $$;
ALTER TABLE public.user_classes ALTER COLUMN course_id SET NOT NULL;

ALTER TABLE public.user_recent_classes
  ADD COLUMN course_id UUID REFERENCES catalog.courses(id) ON DELETE CASCADE;
UPDATE public.user_recent_classes urc
  SET course_id = c.course_id
  FROM catalog.classes c WHERE c.id = urc.class_id;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.user_recent_classes WHERE course_id IS NULL) THEN
    RAISE EXCEPTION 'user_recent_classes has rows with NULL course_id after backfill';
  END IF;
END $$;
ALTER TABLE public.user_recent_classes ALTER COLUMN course_id SET NOT NULL;

-- ────────────────────────────────────────────────
-- 4. Deduplicate classes
--    Same name + cfu = same teaching, merge into one.
--    Winner = most sections, then oldest created_at.
-- ────────────────────────────────────────────────
DO $$
DECLARE
  dup RECORD;
  winner_id UUID;
  loser_id UUID;
BEGIN
  FOR dup IN
    SELECT LOWER(TRIM(c.name)) AS norm_name, c.cfu,
           array_agg(c.id ORDER BY
             (SELECT count(*) FROM catalog.sections WHERE class_id = c.id) DESC,
             c.created_at ASC
           ) AS class_ids
    FROM catalog.classes c
    GROUP BY LOWER(TRIM(c.name)), c.cfu
    HAVING count(*) > 1
  LOOP
    winner_id := dup.class_ids[1];

    FOR i IN 2..array_length(dup.class_ids, 1) LOOP
      loser_id := dup.class_ids[i];

      UPDATE catalog.sections SET class_id = winner_id WHERE class_id = loser_id;

      UPDATE catalog.course_classes SET class_id = winner_id
        WHERE class_id = loser_id
        AND course_id NOT IN (SELECT course_id FROM catalog.course_classes WHERE class_id = winner_id);
      DELETE FROM catalog.course_classes WHERE class_id = loser_id;

      UPDATE public.user_classes SET class_id = winner_id
        WHERE class_id = loser_id
        AND user_id NOT IN (SELECT user_id FROM public.user_classes WHERE class_id = winner_id);
      DELETE FROM public.user_classes WHERE class_id = loser_id;

      UPDATE public.user_recent_classes SET class_id = winner_id
        WHERE class_id = loser_id
        AND user_id NOT IN (SELECT user_id FROM public.user_recent_classes WHERE class_id = winner_id);
      DELETE FROM public.user_recent_classes WHERE class_id = loser_id;

      DELETE FROM catalog.classes WHERE id = loser_id;
    END LOOP;
  END LOOP;
END $$;

-- ────────────────────────────────────────────────
-- 5. Drop old columns from classes
-- ────────────────────────────────────────────────
ALTER TABLE catalog.classes DROP COLUMN course_id CASCADE;
ALTER TABLE catalog.classes DROP COLUMN code;
ALTER TABLE catalog.classes DROP COLUMN class_year;
ALTER TABLE catalog.classes DROP COLUMN catalogue_url;
ALTER TABLE catalog.classes DROP COLUMN curriculum;

-- ────────────────────────────────────────────────
-- 6. RLS: update is_class_admin
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_class_admin(cls_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM catalog.course_classes cc
    WHERE cc.class_id = cls_id
      AND public.is_course_maintainer(cc.course_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, catalog, quiz;

-- ────────────────────────────────────────────────
-- 7. RLS policies on classes
-- ────────────────────────────────────────────────
CREATE POLICY classes_insert ON catalog.classes FOR INSERT
  WITH CHECK (
    public.is_superadmin()
    OR EXISTS (SELECT 1 FROM catalog.course_maintainers WHERE user_id = auth.uid())
  );
CREATE POLICY classes_update ON catalog.classes FOR UPDATE
  USING (public.is_class_admin(id));
CREATE POLICY classes_delete ON catalog.classes FOR DELETE
  USING (public.is_class_admin(id));

-- ────────────────────────────────────────────────
-- 8. RLS for course_classes
-- ────────────────────────────────────────────────
ALTER TABLE catalog.course_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_classes_select ON catalog.course_classes FOR SELECT USING (true);
CREATE POLICY course_classes_insert ON catalog.course_classes FOR INSERT
  WITH CHECK (public.is_course_maintainer(course_id));
CREATE POLICY course_classes_update ON catalog.course_classes FOR UPDATE
  USING (public.is_course_maintainer(course_id));
CREATE POLICY course_classes_delete ON catalog.course_classes FOR DELETE
  USING (public.is_course_maintainer(course_id));

-- ────────────────────────────────────────────────
-- 9. Recreate views
-- ────────────────────────────────────────────────
CREATE VIEW public.user_recent_classes_detail
WITH (security_invoker = true) AS
SELECT
  urc.user_id,
  urc.last_visited,
  urc.visit_count,
  c.id AS class_id,
  c.name AS class_name,
  cc.class_year,
  cc.code AS class_code,
  cc.mandatory,
  cc.catalogue_url,
  cc.curriculum,
  co.id AS course_id,
  co.name AS course_name,
  co.code AS course_code,
  co.course_type,
  d.id AS department_id,
  d.name AS department_name,
  d.code AS department_code
FROM public.user_recent_classes urc
JOIN catalog.classes c ON c.id = urc.class_id
JOIN catalog.courses co ON co.id = urc.course_id
JOIN catalog.departments d ON d.id = co.department_id
LEFT JOIN catalog.course_classes cc ON cc.class_id = c.id AND cc.course_id = co.id;

CREATE VIEW public.user_classes_detail
WITH (security_invoker = true) AS
SELECT
  uc.user_id,
  uc.created_at,
  c.id AS class_id,
  c.name AS class_name,
  cc.class_year,
  cc.code AS class_code,
  cc.mandatory,
  cc.catalogue_url,
  cc.curriculum,
  co.id AS course_id,
  co.name AS course_name,
  co.code AS course_code,
  co.course_type,
  d.id AS department_id,
  d.name AS department_name,
  d.code AS department_code
FROM public.user_classes uc
JOIN catalog.classes c ON c.id = uc.class_id
JOIN catalog.courses co ON co.id = uc.course_id
JOIN catalog.departments d ON d.id = co.department_id
LEFT JOIN catalog.course_classes cc ON cc.class_id = c.id AND cc.course_id = co.id;

CREATE VIEW public.bookmarks_detail
WITH (security_invoker = true) AS
SELECT
  b.user_id,
  b.created_at,
  q.id AS question_id,
  q.content,
  q.question_type,
  q.options,
  q.correct_answer,
  q.explanation,
  q.difficulty,
  s.id AS section_id,
  s.name AS section_name,
  c.id AS class_id,
  c.name AS class_name,
  course_info.course_id,
  course_info.course_name,
  course_info.department_id,
  course_info.department_name
FROM public.bookmarks b
JOIN catalog.questions q ON q.id = b.question_id
JOIN catalog.sections s ON s.id = q.section_id
JOIN catalog.classes c ON c.id = s.class_id
LEFT JOIN LATERAL (
  SELECT co.id AS course_id, co.name AS course_name,
         d.id AS department_id, d.name AS department_name
  FROM catalog.course_classes cc
  JOIN catalog.courses co ON co.id = cc.course_id
  JOIN catalog.departments d ON d.id = co.department_id
  WHERE cc.class_id = c.id
  ORDER BY cc.position
  LIMIT 1
) course_info ON true;

CREATE VIEW public.progress_detail
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.section_id,
  p.quiz_mode,
  p.quizzes_taken,
  p.average_score,
  p.best_score,
  p.total_time_spent,
  p.improvement_rate,
  p.consistency_score,
  p.last_accessed_at,
  p.first_accessed_at,
  p.updated_at,
  s.name AS section_name,
  c.id AS class_id,
  c.name AS class_name,
  course_info.course_id,
  course_info.course_name,
  course_info.department_id,
  course_info.department_name
FROM public.progress p
JOIN catalog.sections s ON s.id = p.section_id
JOIN catalog.classes c ON c.id = s.class_id
LEFT JOIN LATERAL (
  SELECT co.id AS course_id, co.name AS course_name,
         d.id AS department_id, d.name AS department_name
  FROM catalog.course_classes cc
  JOIN catalog.courses co ON co.id = cc.course_id
  JOIN catalog.departments d ON d.id = co.department_id
  WHERE cc.class_id = c.id
  ORDER BY cc.position
  LIMIT 1
) course_info ON true;

CREATE VIEW quiz.quiz_attempts_detail
WITH (security_invoker = true) AS
SELECT
  qa.id,
  qa.user_id,
  qa.quiz_id,
  qa.score,
  qa.time_spent,
  qa.completed_at,
  qz.section_id,
  qz.evaluation_mode_id,
  qz.quiz_mode,
  qz.time_limit,
  s.name AS section_name,
  c.id AS class_id,
  c.name AS class_name,
  course_info.course_id,
  course_info.course_name,
  course_info.department_id,
  course_info.department_name
FROM quiz.quiz_attempts qa
JOIN quiz.quizzes qz ON qz.id = qa.quiz_id
JOIN catalog.sections s ON s.id = qz.section_id
JOIN catalog.classes c ON c.id = s.class_id
LEFT JOIN LATERAL (
  SELECT co.id AS course_id, co.name AS course_name,
         d.id AS department_id, d.name AS department_name
  FROM catalog.course_classes cc
  JOIN catalog.courses co ON co.id = cc.course_id
  JOIN catalog.departments d ON d.id = co.department_id
  WHERE cc.class_id = c.id
  ORDER BY cc.position
  LIMIT 1
) course_info ON true;

CREATE VIEW quiz.quizzes_detail
WITH (security_invoker = true) AS
SELECT
  qz.id,
  qz.time_limit,
  qz.section_id,
  qz.evaluation_mode_id,
  qz.quiz_mode,
  qz.created_at,
  s.name AS section_name,
  s.class_id,
  c.name AS class_name,
  course_info.course_id,
  course_info.course_name,
  course_info.department_id,
  course_info.department_name
FROM quiz.quizzes qz
JOIN catalog.sections s ON s.id = qz.section_id
JOIN catalog.classes c ON c.id = s.class_id
LEFT JOIN LATERAL (
  SELECT co.id AS course_id, co.name AS course_name,
         d.id AS department_id, d.name AS department_name
  FROM catalog.course_classes cc
  JOIN catalog.courses co ON co.id = cc.course_id
  JOIN catalog.departments d ON d.id = co.department_id
  WHERE cc.class_id = c.id
  ORDER BY cc.position
  LIMIT 1
) course_info ON true;
