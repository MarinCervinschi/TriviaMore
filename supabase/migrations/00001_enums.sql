-- ============================================================
-- All application enums
-- ============================================================

CREATE TYPE public.role AS ENUM ('SUPERADMIN', 'ADMIN', 'MAINTAINER', 'STUDENT');
CREATE TYPE public.question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');
CREATE TYPE public.difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE public.course_type AS ENUM ('BACHELOR', 'MASTER');
CREATE TYPE public.quiz_mode AS ENUM ('STUDY', 'EXAM_SIMULATION');

CREATE TYPE public.content_request_type AS ENUM (
  'NEW_SECTION',
  'NEW_QUESTIONS',
  'REPORT',
  'FILE_UPLOAD'
);

CREATE TYPE public.content_request_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_REVISION'
);

CREATE TYPE public.notification_type AS ENUM (
  'REQUEST_STATUS_CHANGED',
  'NEW_REQUEST_RECEIVED',
  'REQUEST_NEEDS_REVISION',
  'REQUEST_REVISED',
  'CONTENT_UPDATED',
  'NEW_SECTION_ADDED'
);
