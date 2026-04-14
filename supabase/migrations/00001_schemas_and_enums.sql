-- ============================================================
-- Schemas, grants, and all application enums
-- ============================================================

-- Create additional schemas
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS quiz;

-- Grant usage to Supabase roles
GRANT USAGE ON SCHEMA catalog TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA quiz TO anon, authenticated, service_role;

-- Default privileges so PostgREST can see tables in new schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA quiz GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- All enums stay in public (used across schemas)
CREATE TYPE public.role AS ENUM ('SUPERADMIN', 'ADMIN', 'MAINTAINER', 'STUDENT');
CREATE TYPE public.question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');
CREATE TYPE public.difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE public.course_type AS ENUM ('BACHELOR', 'MASTER', 'SINGLE_CYCLE');
CREATE TYPE public.department_area AS ENUM ('SCIENZE', 'TECNOLOGIA', 'SALUTE', 'VITA', 'SOCIETA_CULTURA');
CREATE TYPE public.quiz_mode AS ENUM ('STUDY', 'EXAM_SIMULATION');
CREATE TYPE public.content_request_type AS ENUM ('NEW_SECTION', 'NEW_QUESTIONS', 'REPORT', 'FILE_UPLOAD');
CREATE TYPE public.content_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');
CREATE TYPE public.notification_type AS ENUM (
  'REQUEST_STATUS_CHANGED',
  'NEW_REQUEST_RECEIVED',
  'REQUEST_NEEDS_REVISION',
  'REQUEST_REVISED',
  'CONTENT_UPDATED',
  'NEW_SECTION_ADDED'
);
CREATE TYPE public.campus_location AS ENUM ('MODENA', 'REGGIO_EMILIA', 'CARPI', 'MANTOVA');
