-- ============================================================
-- Cross-schema views (final state, using course_classes N:M)
-- All views use security_invoker so RLS is enforced
-- ============================================================

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
