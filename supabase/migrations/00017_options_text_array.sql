-- Convert catalog.questions.options from JSONB to TEXT[],
-- recreate dependent view, and add type-specific CHECK constraints.

BEGIN;

-- Helper function used in the USING clause (Postgres forbids subqueries inline).
CREATE FUNCTION public._jsonb_to_text_array(j jsonb) RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN j IS NULL THEN NULL
    ELSE ARRAY(SELECT jsonb_array_elements_text(j))
  END
$$;

DROP VIEW public.bookmarks_detail;

ALTER TABLE catalog.questions
  ALTER COLUMN options TYPE TEXT[]
  USING public._jsonb_to_text_array(options);

DROP FUNCTION public._jsonb_to_text_array(jsonb);

ALTER TABLE catalog.questions
  ADD CONSTRAINT questions_options_shape_check CHECK (
    (question_type = 'SHORT_ANSWER'    AND options IS NULL)
    OR (question_type = 'TRUE_FALSE'   AND options = ARRAY['Vero','Falso'])
    OR (question_type = 'MULTIPLE_CHOICE' AND array_length(options, 1) BETWEEN 2 AND 40)
  );

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

COMMIT;
