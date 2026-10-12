-- The schema as of 0069, for an empty Postgres; the migrations before it are in drizzle/archive/.
-- Supabase owns the auth schema. On a plain Postgres a minimal stand-in keeps the profiles foreign key and the sign-up trigger working until Better Auth replaces them (#211).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY,
      email text,
      raw_user_meta_data jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;
--> statement-breakpoint
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: catalog; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA catalog;

--
-- Name: crm; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA crm;

--
-- Name: internal; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA internal;

--
-- Name: ops; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA ops;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;

--
-- Name: quiz; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA quiz;

--
-- Name: achievement_comparator; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.achievement_comparator AS ENUM (
    'GTE',
    'LTE'
);

--
-- Name: achievement_metric; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.achievement_metric AS ENUM (
    'QUIZZES_COMPLETED',
    'DISTINCT_SECTIONS',
    'DISTINCT_CLASSES',
    'DISTINCT_DEPARTMENTS',
    'PERFECT_QUIZZES',
    'HARD_CORRECT',
    'EXAM_SIMS_PASSED',
    'MAX_SECTION_IMPROVEMENT',
    'ACTIVE_WEEKS',
    'BEST_DAY_STREAK',
    'TOTAL_TIME_MS',
    'FLASHCARD_SESSIONS',
    'BOOKMARKED_THEN_CORRECT',
    'APPROVED_REQUESTS',
    'SIGNUP_RANK',
    'ENROLLMENT_DECLARED',
    'EXAMS_PASSED',
    'CFU_EARNED',
    'HONOURS_EARNED',
    'TASKS_DONE'
);

--
-- Name: campus_location; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campus_location AS ENUM (
    'MODENA',
    'REGGIO_EMILIA',
    'CARPI',
    'MANTOVA'
);

--
-- Name: career_exam_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.career_exam_status AS ENUM (
    'PLANNED',
    'PASSED',
    'REJECTED'
);

--
-- Name: content_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_REVISION'
);

--
-- Name: content_request_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_request_type AS ENUM (
    'NEW_SECTION',
    'NEW_QUESTIONS',
    'REPORT',
    'FILE_UPLOAD'
);

--
-- Name: course_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.course_type AS ENUM (
    'BACHELOR',
    'MASTER',
    'SINGLE_CYCLE'
);

--
-- Name: department_area; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.department_area AS ENUM (
    'SCIENZE',
    'TECNOLOGIA',
    'SALUTE',
    'VITA',
    'SOCIETA_CULTURA'
);

--
-- Name: difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);

--
-- Name: evaluation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evaluation_type AS ENUM (
    'GRADED',
    'PASS_FAIL',
    'NONE'
);

--
-- Name: job_run_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_run_status AS ENUM (
    'QUEUED',
    'RUNNING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED'
);

--
-- Name: job_run_trigger; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_run_trigger AS ENUM (
    'MANUAL',
    'SCHEDULE'
);

--
-- Name: legal_document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.legal_document_type AS ENUM (
    'TERMS',
    'PRIVACY'
);

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'REQUEST_STATUS_CHANGED',
    'NEW_REQUEST_RECEIVED',
    'REQUEST_NEEDS_REVISION',
    'REQUEST_REVISED',
    'CONTENT_UPDATED',
    'NEW_SECTION_ADDED',
    'MAINTAINER_ASSIGNED',
    'ACHIEVEMENT_UNLOCKED'
);

--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'SHORT_ANSWER'
);

--
-- Name: quiz_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_mode AS ENUM (
    'STUDY',
    'EXAM_SIMULATION'
);

--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'MAINTAINER',
    'STUDENT'
);

--
-- Name: tmp_e; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tmp_e AS ENUM (
    'a'
);

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: class_syllabi; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.class_syllabi (
    class_id uuid NOT NULL,
    academic_year integer NOT NULL,
    catalogue_url text,
    objectives text,
    contents text,
    prerequisites text,
    assessment text,
    readings text,
    teaching_methods text,
    outcomes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: classes; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    cfu integer,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('italian'::regconfig, COALESCE(name, ''::text))) STORED,
    ssd text
);

--
-- Name: course_classes; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.course_classes (
    course_id uuid NOT NULL,
    class_id uuid NOT NULL,
    code text NOT NULL,
    class_year integer NOT NULL,
    mandatory boolean DEFAULT false NOT NULL,
    catalogue_url text,
    curriculum text,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    evaluation public.evaluation_type,
    taf text,
    teaching_period text,
    is_teaching boolean
);

--
-- Name: course_curricula; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.course_curricula (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    cohort integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    common boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: course_plans; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.course_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    cohort integer NOT NULL,
    curriculum_id uuid NOT NULL,
    code text NOT NULL,
    class_id uuid,
    name text NOT NULL,
    cfu integer,
    class_year integer NOT NULL,
    mandatory boolean DEFAULT false NOT NULL,
    evaluation public.evaluation_type,
    taf text,
    teaching_period text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    group_code text,
    group_label text,
    group_position integer
);

--
-- Name: courses; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    department_id uuid NOT NULL,
    location public.campus_location,
    cfu integer,
    "position" integer DEFAULT 0 NOT NULL,
    course_type public.course_type DEFAULT 'BACHELOR'::public.course_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('italian'::regconfig, ((COALESCE(name, ''::text) || ' '::text) || COALESCE(code, ''::text)))) STORED,
    national_code text,
    degree_class text,
    teaching_language text,
    restricted_access boolean,
    catalogue_url text
);

--
-- Name: department_locations; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.department_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    campus_location public.campus_location,
    is_primary boolean DEFAULT false,
    "position" smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: departments; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    area public.department_area,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    catalogue_code text
);

--
-- Name: questions; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    question_type public.question_type NOT NULL,
    options text[],
    correct_answer text[] NOT NULL,
    explanation text,
    difficulty public.difficulty DEFAULT 'MEDIUM'::public.difficulty NOT NULL,
    section_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT questions_options_shape_check CHECK ((((question_type = 'SHORT_ANSWER'::public.question_type) AND (options IS NULL)) OR ((question_type = 'TRUE_FALSE'::public.question_type) AND (options = ARRAY['Vero'::text, 'Falso'::text])) OR ((question_type = 'MULTIPLE_CHOICE'::public.question_type) AND ((array_length(options, 1) >= 2) AND (array_length(options, 1) <= 40)))))
);

--
-- Name: sections; Type: TABLE; Schema: catalog; Owner: -
--

CREATE TABLE catalog.sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_public boolean DEFAULT true NOT NULL,
    class_id uuid NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text GENERATED ALWAYS AS (lower(replace(name, ' '::text, '-'::text))) STORED
);

--
-- Name: calendar_events; Type: TABLE; Schema: crm; Owner: -
--

CREATE TABLE crm.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    title text NOT NULL,
    notes text,
    career_exam_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    end_date date,
    recurrence text,
    color text,
    CONSTRAINT calendar_events_color_check CHECK (((color IS NULL) OR (color = ANY (ARRAY['chart-1'::text, 'chart-2'::text, 'chart-3'::text, 'chart-4'::text, 'chart-5'::text])))),
    CONSTRAINT calendar_events_end_date_check CHECK (((end_date IS NULL) OR (end_date > date))),
    CONSTRAINT calendar_events_notes_check CHECK (((notes IS NULL) OR (length(notes) <= 2000))),
    CONSTRAINT calendar_events_recurrence_check CHECK (((recurrence IS NULL) OR (length(recurrence) <= 200))),
    CONSTRAINT calendar_events_time_check CHECK (((end_time IS NULL) OR ((start_time IS NOT NULL) AND ((end_date IS NOT NULL) OR (end_time > start_time))))),
    CONSTRAINT calendar_events_title_check CHECK (((length(title) >= 1) AND (length(title) <= 120)))
);

--
-- Name: career_exams; Type: TABLE; Schema: crm; Owner: -
--

CREATE TABLE crm.career_exams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    class_id uuid,
    plan_code text,
    group_code text,
    name text NOT NULL,
    cfu integer NOT NULL,
    class_year integer,
    graded boolean DEFAULT true NOT NULL,
    status public.career_exam_status DEFAULT 'PLANNED'::public.career_exam_status NOT NULL,
    grade integer,
    honours boolean DEFAULT false NOT NULL,
    exam_date date,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    external boolean DEFAULT false NOT NULL,
    CONSTRAINT career_exams_cfu_check CHECK ((cfu > 0)),
    CONSTRAINT career_exams_grade_check CHECK (((grade IS NULL) OR ((grade >= 18) AND (grade <= 30)))),
    CONSTRAINT career_exams_honours_check CHECK (((NOT honours) OR (grade = 30)))
);

--
-- Name: enrollments; Type: TABLE; Schema: crm; Owner: -
--

CREATE TABLE crm.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    start_year integer,
    is_current boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    curriculum_id uuid,
    career_settings jsonb DEFAULT '{}'::jsonb NOT NULL
);

--
-- Name: exam_sittings; Type: TABLE; Schema: crm; Owner: -
--

CREATE TABLE crm.exam_sittings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    career_exam_id uuid NOT NULL,
    date date NOT NULL,
    label text,
    chosen boolean DEFAULT false NOT NULL,
    importance smallint DEFAULT 2 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exam_sittings_importance_check CHECK (((importance >= 1) AND (importance <= 3))),
    CONSTRAINT exam_sittings_label_check CHECK (((label IS NULL) OR (length(label) <= 40)))
);

--
-- Name: tasks; Type: TABLE; Schema: crm; Owner: -
--

CREATE TABLE crm.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    notes text,
    due_date date NOT NULL,
    due_time time without time zone,
    end_time time without time zone,
    done boolean DEFAULT false NOT NULL,
    done_at timestamp with time zone,
    career_exam_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    color text,
    CONSTRAINT tasks_color_check CHECK (((color IS NULL) OR (color = ANY (ARRAY['chart-1'::text, 'chart-2'::text, 'chart-3'::text, 'chart-4'::text, 'chart-5'::text])))),
    CONSTRAINT tasks_done_at_check CHECK ((done OR (done_at IS NULL))),
    CONSTRAINT tasks_end_time_check CHECK (((end_time IS NULL) OR ((due_time IS NOT NULL) AND (end_time > due_time)))),
    CONSTRAINT tasks_notes_check CHECK (((notes IS NULL) OR (length(notes) <= 2000))),
    CONSTRAINT tasks_title_check CHECK (((length(title) >= 1) AND (length(title) <= 200)))
);

--
-- Name: content_requests; Type: TABLE; Schema: internal; Owner: -
--

CREATE TABLE internal.content_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    request_type public.content_request_type NOT NULL,
    status public.content_request_status DEFAULT 'PENDING'::public.content_request_status NOT NULL,
    submitted_content jsonb NOT NULL,
    target_department_id uuid,
    target_course_id uuid,
    target_class_id uuid,
    target_section_id uuid,
    handled_by uuid,
    handled_at timestamp with time zone,
    admin_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: course_maintainers; Type: TABLE; Schema: internal; Owner: -
--

CREATE TABLE internal.course_maintainers (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: department_admins; Type: TABLE; Schema: internal; Owner: -
--

CREATE TABLE internal.department_admins (
    user_id uuid NOT NULL,
    department_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: legal_acceptances; Type: TABLE; Schema: internal; Owner: -
--

CREATE TABLE internal.legal_acceptances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_type public.legal_document_type NOT NULL,
    version text NOT NULL,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address inet,
    user_agent text
);

--
-- Name: section_access; Type: TABLE; Schema: internal; Owner: -
--

CREATE TABLE internal.section_access (
    user_id uuid NOT NULL,
    section_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: job_runs; Type: TABLE; Schema: ops; Owner: -
--

CREATE TABLE ops.job_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job text NOT NULL,
    params jsonb DEFAULT '{}'::jsonb NOT NULL,
    dry_run boolean DEFAULT false NOT NULL,
    status public.job_run_status DEFAULT 'QUEUED'::public.job_run_status NOT NULL,
    trigger public.job_run_trigger DEFAULT 'MANUAL'::public.job_run_trigger NOT NULL,
    requested_by uuid,
    queue_job_id uuid,
    summary jsonb,
    error text,
    queued_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    schedule_key text,
    changes jsonb,
    cancel_requested_at timestamp with time zone
);

--
-- Name: job_schedules; Type: TABLE; Schema: ops; Owner: -
--

CREATE TABLE ops.job_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job text NOT NULL,
    cron text NOT NULL,
    timezone text DEFAULT 'Europe/Rome'::text NOT NULL,
    params jsonb DEFAULT '{}'::jsonb NOT NULL,
    dry_run boolean DEFAULT true NOT NULL,
    paused boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: job_texts; Type: TABLE; Schema: ops; Owner: -
--

CREATE TABLE ops.job_texts (
    job text NOT NULL,
    label text,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_texts_description_check CHECK (((description IS NULL) OR ((length(description) >= 1) AND (length(description) <= 400)))),
    CONSTRAINT job_texts_label_check CHECK (((label IS NULL) OR ((length(label) >= 1) AND (length(label) <= 80))))
);

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    key text NOT NULL,
    family text NOT NULL,
    tier smallint DEFAULT 1 NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    metric public.achievement_metric NOT NULL,
    comparator public.achievement_comparator DEFAULT 'GTE'::public.achievement_comparator NOT NULL,
    threshold double precision NOT NULL,
    icon text NOT NULL,
    accent text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    shape text DEFAULT 'seal'::text NOT NULL
);

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmarks (
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    body text,
    reference_id text,
    reference_type text,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    email text,
    image text,
    role public.role DEFAULT 'STUDENT'::public.role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    signup_rank integer
);

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    user_id uuid NOT NULL,
    achievement_key text NOT NULL,
    awarded_at timestamp with time zone DEFAULT now() NOT NULL,
    metric_value double precision,
    pin_position smallint
);

--
-- Name: user_changelog_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_changelog_reads (
    user_id uuid NOT NULL,
    version text NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: user_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_classes (
    user_id uuid NOT NULL,
    class_id uuid NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: user_day_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_day_activity (
    user_id uuid NOT NULL,
    day date NOT NULL,
    quizzes integer DEFAULT 0 NOT NULL,
    flashcards integer DEFAULT 0 NOT NULL
);

--
-- Name: user_question_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_question_stats (
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    hard_correct boolean DEFAULT false NOT NULL,
    bookmarked_then_correct boolean DEFAULT false NOT NULL
);

--
-- Name: user_recent_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_recent_classes (
    user_id uuid NOT NULL,
    class_id uuid NOT NULL,
    course_id uuid NOT NULL,
    last_visited timestamp with time zone DEFAULT now() NOT NULL,
    visit_count integer DEFAULT 1 NOT NULL
);

--
-- Name: user_section_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_section_stats (
    user_id uuid NOT NULL,
    section_id uuid NOT NULL,
    runs integer DEFAULT 0 NOT NULL,
    first_score double precision,
    last_score double precision,
    first_at timestamp with time zone,
    last_at timestamp with time zone
);

--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stats (
    user_id uuid NOT NULL,
    quizzes_completed integer DEFAULT 0 NOT NULL,
    perfect_quizzes integer DEFAULT 0 NOT NULL,
    exam_sims_passed integer DEFAULT 0 NOT NULL,
    flashcard_sessions integer DEFAULT 0 NOT NULL,
    approved_requests integer DEFAULT 0 NOT NULL,
    total_time_ms bigint DEFAULT 0 NOT NULL,
    hard_correct integer DEFAULT 0 NOT NULL,
    bookmarked_then_correct integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: answer_attempts; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.answer_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_attempt_id uuid NOT NULL,
    question_id uuid,
    user_answer text[] NOT NULL,
    score double precision NOT NULL,
    section_id uuid,
    difficulty public.difficulty,
    question_type public.question_type,
    is_correct boolean
);

--
-- Name: evaluation_modes; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.evaluation_modes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    correct_answer_points double precision DEFAULT 1.0 NOT NULL,
    incorrect_answer_points double precision DEFAULT 0.0 NOT NULL,
    partial_credit_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: flashcard_attempts; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.flashcard_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    section_id uuid,
    cards_reviewed integer,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    session_id text
);

--
-- Name: quiz_attempts; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    quiz_id uuid,
    score double precision NOT NULL,
    time_spent integer,
    completed_at timestamp with time zone,
    section_id uuid,
    quiz_mode public.quiz_mode,
    is_favorite boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: quiz_questions; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    question_id uuid NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: quizzes; Type: TABLE; Schema: quiz; Owner: -
--

CREATE TABLE quiz.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    time_limit integer,
    section_id uuid NOT NULL,
    evaluation_mode_id uuid NOT NULL,
    quiz_mode public.quiz_mode DEFAULT 'STUDY'::public.quiz_mode NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: class_syllabi class_syllabi_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.class_syllabi
    ADD CONSTRAINT class_syllabi_pkey PRIMARY KEY (class_id);

--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);

--
-- Name: course_classes course_classes_code_course_id_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_classes
    ADD CONSTRAINT course_classes_code_course_id_key UNIQUE (code, course_id);

--
-- Name: course_classes course_classes_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_classes
    ADD CONSTRAINT course_classes_pkey PRIMARY KEY (course_id, class_id);

--
-- Name: course_curricula course_curricula_course_id_cohort_code_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_curricula
    ADD CONSTRAINT course_curricula_course_id_cohort_code_key UNIQUE (course_id, cohort, code);

--
-- Name: course_curricula course_curricula_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_curricula
    ADD CONSTRAINT course_curricula_pkey PRIMARY KEY (id);

--
-- Name: course_plans course_plans_curriculum_id_code_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_plans
    ADD CONSTRAINT course_plans_curriculum_id_code_key UNIQUE (curriculum_id, code);

--
-- Name: course_plans course_plans_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_plans
    ADD CONSTRAINT course_plans_pkey PRIMARY KEY (id);

--
-- Name: courses courses_code_department_id_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_code_department_id_key UNIQUE (code, department_id);

--
-- Name: courses courses_national_code_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_national_code_key UNIQUE (national_code);

--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);

--
-- Name: department_locations department_locations_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.department_locations
    ADD CONSTRAINT department_locations_pkey PRIMARY KEY (id);

--
-- Name: departments departments_catalogue_code_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.departments
    ADD CONSTRAINT departments_catalogue_code_key UNIQUE (catalogue_code);

--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);

--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);

--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);

--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);

--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);

--
-- Name: career_exams career_exams_pkey; Type: CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.career_exams
    ADD CONSTRAINT career_exams_pkey PRIMARY KEY (id);

--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);

--
-- Name: exam_sittings exam_sittings_pkey; Type: CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.exam_sittings
    ADD CONSTRAINT exam_sittings_pkey PRIMARY KEY (id);

--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);

--
-- Name: content_requests content_requests_pkey; Type: CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_pkey PRIMARY KEY (id);

--
-- Name: course_maintainers course_maintainers_pkey; Type: CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.course_maintainers
    ADD CONSTRAINT course_maintainers_pkey PRIMARY KEY (user_id, course_id);

--
-- Name: department_admins department_admins_pkey; Type: CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.department_admins
    ADD CONSTRAINT department_admins_pkey PRIMARY KEY (user_id, department_id);

--
-- Name: legal_acceptances legal_acceptances_pkey; Type: CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.legal_acceptances
    ADD CONSTRAINT legal_acceptances_pkey PRIMARY KEY (id);

--
-- Name: section_access section_access_pkey; Type: CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.section_access
    ADD CONSTRAINT section_access_pkey PRIMARY KEY (user_id, section_id);

--
-- Name: job_runs job_runs_pkey; Type: CONSTRAINT; Schema: ops; Owner: -
--

ALTER TABLE ONLY ops.job_runs
    ADD CONSTRAINT job_runs_pkey PRIMARY KEY (id);

--
-- Name: job_schedules job_schedules_pkey; Type: CONSTRAINT; Schema: ops; Owner: -
--

ALTER TABLE ONLY ops.job_schedules
    ADD CONSTRAINT job_schedules_pkey PRIMARY KEY (id);

--
-- Name: job_texts job_texts_pkey; Type: CONSTRAINT; Schema: ops; Owner: -
--

ALTER TABLE ONLY ops.job_texts
    ADD CONSTRAINT job_texts_pkey PRIMARY KEY (job);

--
-- Name: achievements achievements_family_tier_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_family_tier_key UNIQUE (family, tier);

--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (key);

--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (user_id, question_id);

--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);

--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_key);

--
-- Name: user_changelog_reads user_changelog_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_changelog_reads
    ADD CONSTRAINT user_changelog_reads_pkey PRIMARY KEY (user_id, version);

--
-- Name: user_classes user_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_classes
    ADD CONSTRAINT user_classes_pkey PRIMARY KEY (user_id, class_id);

--
-- Name: user_day_activity user_day_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_activity
    ADD CONSTRAINT user_day_activity_pkey PRIMARY KEY (user_id, day);

--
-- Name: user_question_stats user_question_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_question_stats
    ADD CONSTRAINT user_question_stats_pkey PRIMARY KEY (user_id, question_id);

--
-- Name: user_recent_classes user_recent_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_recent_classes
    ADD CONSTRAINT user_recent_classes_pkey PRIMARY KEY (user_id, class_id);

--
-- Name: user_section_stats user_section_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_section_stats
    ADD CONSTRAINT user_section_stats_pkey PRIMARY KEY (user_id, section_id);

--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);

--
-- Name: answer_attempts answer_attempts_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.answer_attempts
    ADD CONSTRAINT answer_attempts_pkey PRIMARY KEY (id);

--
-- Name: answer_attempts answer_attempts_quiz_attempt_id_question_id_key; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.answer_attempts
    ADD CONSTRAINT answer_attempts_quiz_attempt_id_question_id_key UNIQUE (quiz_attempt_id, question_id);

--
-- Name: evaluation_modes evaluation_modes_name_key; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.evaluation_modes
    ADD CONSTRAINT evaluation_modes_name_key UNIQUE (name);

--
-- Name: evaluation_modes evaluation_modes_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.evaluation_modes
    ADD CONSTRAINT evaluation_modes_pkey PRIMARY KEY (id);

--
-- Name: flashcard_attempts flashcard_attempts_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.flashcard_attempts
    ADD CONSTRAINT flashcard_attempts_pkey PRIMARY KEY (id);

--
-- Name: flashcard_attempts flashcard_attempts_user_id_session_id_key; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.flashcard_attempts
    ADD CONSTRAINT flashcard_attempts_user_id_session_id_key UNIQUE (user_id, session_id);

--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);

--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);

--
-- Name: quiz_questions quiz_questions_quiz_id_question_id_key; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_question_id_key UNIQUE (quiz_id, question_id);

--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);

--
-- Name: classes_fts_idx; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX classes_fts_idx ON catalog.classes USING gin (fts);

--
-- Name: courses_fts_idx; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX courses_fts_idx ON catalog.courses USING gin (fts);

--
-- Name: idx_classes_position; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_classes_position ON catalog.classes USING btree ("position");

--
-- Name: idx_course_classes_class; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_course_classes_class ON catalog.course_classes USING btree (class_id);

--
-- Name: idx_course_plans_class; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_course_plans_class ON catalog.course_plans USING btree (class_id);

--
-- Name: idx_course_plans_course_cohort; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_course_plans_course_cohort ON catalog.course_plans USING btree (course_id, cohort);

--
-- Name: idx_courses_position; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_courses_position ON catalog.courses USING btree ("position");

--
-- Name: idx_department_locations_dept; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_department_locations_dept ON catalog.department_locations USING btree (department_id);

--
-- Name: idx_departments_position; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_departments_position ON catalog.departments USING btree ("position");

--
-- Name: idx_questions_difficulty; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_questions_difficulty ON catalog.questions USING btree (difficulty);

--
-- Name: idx_questions_question_type; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_questions_question_type ON catalog.questions USING btree (question_type);

--
-- Name: idx_questions_section_id; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_questions_section_id ON catalog.questions USING btree (section_id);

--
-- Name: idx_sections_position; Type: INDEX; Schema: catalog; Owner: -
--

CREATE INDEX idx_sections_position ON catalog.sections USING btree ("position");

--
-- Name: sections_class_id_slug_key; Type: INDEX; Schema: catalog; Owner: -
--

CREATE UNIQUE INDEX sections_class_id_slug_key ON catalog.sections USING btree (class_id, slug);

--
-- Name: enrollments_user_id_course_id_key; Type: INDEX; Schema: crm; Owner: -
--

CREATE UNIQUE INDEX enrollments_user_id_course_id_key ON crm.enrollments USING btree (user_id, course_id);

--
-- Name: enrollments_user_id_current_key; Type: INDEX; Schema: crm; Owner: -
--

CREATE UNIQUE INDEX enrollments_user_id_current_key ON crm.enrollments USING btree (user_id) WHERE is_current;

--
-- Name: exam_sittings_one_chosen; Type: INDEX; Schema: crm; Owner: -
--

CREATE UNIQUE INDEX exam_sittings_one_chosen ON crm.exam_sittings USING btree (career_exam_id) WHERE chosen;

--
-- Name: idx_calendar_events_career_exam; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_calendar_events_career_exam ON crm.calendar_events USING btree (career_exam_id);

--
-- Name: idx_calendar_events_user_date; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_calendar_events_user_date ON crm.calendar_events USING btree (user_id, date);

--
-- Name: idx_career_exams_class; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_career_exams_class ON crm.career_exams USING btree (class_id);

--
-- Name: idx_career_exams_enrollment; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_career_exams_enrollment ON crm.career_exams USING btree (enrollment_id);

--
-- Name: idx_enrollments_user; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_enrollments_user ON crm.enrollments USING btree (user_id);

--
-- Name: idx_exam_sittings_exam_date; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_exam_sittings_exam_date ON crm.exam_sittings USING btree (career_exam_id, date);

--
-- Name: idx_tasks_career_exam; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_tasks_career_exam ON crm.tasks USING btree (career_exam_id);

--
-- Name: idx_tasks_user_due; Type: INDEX; Schema: crm; Owner: -
--

CREATE INDEX idx_tasks_user_due ON crm.tasks USING btree (user_id, due_date);

--
-- Name: uq_career_exams_plan_row; Type: INDEX; Schema: crm; Owner: -
--

CREATE UNIQUE INDEX uq_career_exams_plan_row ON crm.career_exams USING btree (enrollment_id, plan_code, COALESCE(group_code, ''::text)) WHERE (plan_code IS NOT NULL);

--
-- Name: idx_content_requests_created_at; Type: INDEX; Schema: internal; Owner: -
--

CREATE INDEX idx_content_requests_created_at ON internal.content_requests USING btree (created_at DESC);

--
-- Name: idx_content_requests_status; Type: INDEX; Schema: internal; Owner: -
--

CREATE INDEX idx_content_requests_status ON internal.content_requests USING btree (status);

--
-- Name: idx_content_requests_user_id; Type: INDEX; Schema: internal; Owner: -
--

CREATE INDEX idx_content_requests_user_id ON internal.content_requests USING btree (user_id);

--
-- Name: idx_legal_acceptances_lookup; Type: INDEX; Schema: internal; Owner: -
--

CREATE INDEX idx_legal_acceptances_lookup ON internal.legal_acceptances USING btree (user_id, document_type, version);

--
-- Name: idx_legal_acceptances_user; Type: INDEX; Schema: internal; Owner: -
--

CREATE INDEX idx_legal_acceptances_user ON internal.legal_acceptances USING btree (user_id);

--
-- Name: idx_job_runs_active; Type: INDEX; Schema: ops; Owner: -
--

CREATE INDEX idx_job_runs_active ON ops.job_runs USING btree (status) WHERE (status = ANY (ARRAY['QUEUED'::public.job_run_status, 'RUNNING'::public.job_run_status]));

--
-- Name: idx_job_runs_job_queued_at; Type: INDEX; Schema: ops; Owner: -
--

CREATE INDEX idx_job_runs_job_queued_at ON ops.job_runs USING btree (job, queued_at DESC);

--
-- Name: idx_achievements_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_achievements_position ON public.achievements USING btree ("position");

--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id) WHERE (is_read = false);

--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

--
-- Name: idx_user_achievements_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_pinned ON public.user_achievements USING btree (user_id) WHERE (pin_position IS NOT NULL);

--
-- Name: idx_user_changelog_reads_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_changelog_reads_user ON public.user_changelog_reads USING btree (user_id);

--
-- Name: idx_answer_attempts_section_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_answer_attempts_section_id ON quiz.answer_attempts USING btree (section_id);

--
-- Name: idx_flashcard_attempts_completed_at; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_flashcard_attempts_completed_at ON quiz.flashcard_attempts USING btree (completed_at);

--
-- Name: idx_flashcard_attempts_section_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_flashcard_attempts_section_id ON quiz.flashcard_attempts USING btree (section_id);

--
-- Name: idx_flashcard_attempts_user_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_flashcard_attempts_user_id ON quiz.flashcard_attempts USING btree (user_id);

--
-- Name: idx_quiz_attempts_completed_at; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quiz_attempts_completed_at ON quiz.quiz_attempts USING btree (completed_at);

--
-- Name: idx_quiz_attempts_quiz_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz.quiz_attempts USING btree (quiz_id);

--
-- Name: idx_quiz_attempts_section_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quiz_attempts_section_id ON quiz.quiz_attempts USING btree (section_id);

--
-- Name: idx_quiz_attempts_user_favorite; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quiz_attempts_user_favorite ON quiz.quiz_attempts USING btree (user_id) WHERE is_favorite;

--
-- Name: idx_quiz_attempts_user_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quiz_attempts_user_id ON quiz.quiz_attempts USING btree (user_id);

--
-- Name: idx_quiz_attempts_user_open; Type: INDEX; Schema: quiz; Owner: -
--

CREATE UNIQUE INDEX idx_quiz_attempts_user_open ON quiz.quiz_attempts USING btree (user_id) WHERE (completed_at IS NULL);

--
-- Name: idx_quizzes_evaluation_mode_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quizzes_evaluation_mode_id ON quiz.quizzes USING btree (evaluation_mode_id);

--
-- Name: idx_quizzes_quiz_mode; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quizzes_quiz_mode ON quiz.quizzes USING btree (quiz_mode);

--
-- Name: idx_quizzes_section_id; Type: INDEX; Schema: quiz; Owner: -
--

CREATE INDEX idx_quizzes_section_id ON quiz.quizzes USING btree (section_id);

--
-- Name: class_syllabi set_class_syllabi_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_class_syllabi_updated_at BEFORE UPDATE ON catalog.class_syllabi FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: classes set_classes_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON catalog.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: course_classes set_course_classes_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_course_classes_updated_at BEFORE UPDATE ON catalog.course_classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: course_curricula set_course_curricula_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_course_curricula_updated_at BEFORE UPDATE ON catalog.course_curricula FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: course_plans set_course_plans_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_course_plans_updated_at BEFORE UPDATE ON catalog.course_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: courses set_courses_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON catalog.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: department_locations set_department_locations_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_department_locations_updated_at BEFORE UPDATE ON catalog.department_locations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: departments set_departments_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_departments_updated_at BEFORE UPDATE ON catalog.departments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: questions set_questions_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_questions_updated_at BEFORE UPDATE ON catalog.questions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: sections set_sections_updated_at; Type: TRIGGER; Schema: catalog; Owner: -
--

CREATE TRIGGER set_sections_updated_at BEFORE UPDATE ON catalog.sections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: calendar_events set_calendar_events_updated_at; Type: TRIGGER; Schema: crm; Owner: -
--

CREATE TRIGGER set_calendar_events_updated_at BEFORE UPDATE ON crm.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: career_exams set_career_exams_updated_at; Type: TRIGGER; Schema: crm; Owner: -
--

CREATE TRIGGER set_career_exams_updated_at BEFORE UPDATE ON crm.career_exams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: enrollments set_enrollments_updated_at; Type: TRIGGER; Schema: crm; Owner: -
--

CREATE TRIGGER set_enrollments_updated_at BEFORE UPDATE ON crm.enrollments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: exam_sittings set_exam_sittings_updated_at; Type: TRIGGER; Schema: crm; Owner: -
--

CREATE TRIGGER set_exam_sittings_updated_at BEFORE UPDATE ON crm.exam_sittings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: tasks set_tasks_updated_at; Type: TRIGGER; Schema: crm; Owner: -
--

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON crm.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: content_requests set_content_requests_updated_at; Type: TRIGGER; Schema: internal; Owner: -
--

CREATE TRIGGER set_content_requests_updated_at BEFORE UPDATE ON internal.content_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: job_schedules set_job_schedules_updated_at; Type: TRIGGER; Schema: ops; Owner: -
--

CREATE TRIGGER set_job_schedules_updated_at BEFORE UPDATE ON ops.job_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: profiles set_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: user_classes set_user_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_user_classes_updated_at BEFORE UPDATE ON public.user_classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: evaluation_modes set_evaluation_modes_updated_at; Type: TRIGGER; Schema: quiz; Owner: -
--

CREATE TRIGGER set_evaluation_modes_updated_at BEFORE UPDATE ON quiz.evaluation_modes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--
-- Name: class_syllabi class_syllabi_class_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.class_syllabi
    ADD CONSTRAINT class_syllabi_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: course_classes course_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_classes
    ADD CONSTRAINT course_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: course_classes course_classes_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_classes
    ADD CONSTRAINT course_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: course_curricula course_curricula_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_curricula
    ADD CONSTRAINT course_curricula_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: course_plans course_plans_class_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_plans
    ADD CONSTRAINT course_plans_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE SET NULL;

--
-- Name: course_plans course_plans_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_plans
    ADD CONSTRAINT course_plans_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: course_plans course_plans_curriculum_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.course_plans
    ADD CONSTRAINT course_plans_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES catalog.course_curricula(id) ON DELETE CASCADE;

--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES catalog.departments(id) ON DELETE CASCADE;

--
-- Name: department_locations department_locations_department_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.department_locations
    ADD CONSTRAINT department_locations_department_id_fkey FOREIGN KEY (department_id) REFERENCES catalog.departments(id) ON DELETE CASCADE;

--
-- Name: questions questions_section_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.questions
    ADD CONSTRAINT questions_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE CASCADE;

--
-- Name: sections sections_class_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: -
--

ALTER TABLE ONLY catalog.sections
    ADD CONSTRAINT sections_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: calendar_events calendar_events_career_exam_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.calendar_events
    ADD CONSTRAINT calendar_events_career_exam_id_fkey FOREIGN KEY (career_exam_id) REFERENCES crm.career_exams(id) ON DELETE SET NULL;

--
-- Name: calendar_events calendar_events_user_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.calendar_events
    ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: career_exams career_exams_class_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.career_exams
    ADD CONSTRAINT career_exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE SET NULL;

--
-- Name: career_exams career_exams_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.career_exams
    ADD CONSTRAINT career_exams_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES crm.enrollments(id) ON DELETE CASCADE;

--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE RESTRICT;

--
-- Name: enrollments enrollments_curriculum_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.enrollments
    ADD CONSTRAINT enrollments_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES catalog.course_curricula(id) ON DELETE SET NULL;

--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: exam_sittings exam_sittings_career_exam_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.exam_sittings
    ADD CONSTRAINT exam_sittings_career_exam_id_fkey FOREIGN KEY (career_exam_id) REFERENCES crm.career_exams(id) ON DELETE CASCADE;

--
-- Name: tasks tasks_career_exam_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.tasks
    ADD CONSTRAINT tasks_career_exam_id_fkey FOREIGN KEY (career_exam_id) REFERENCES crm.career_exams(id) ON DELETE SET NULL;

--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: crm; Owner: -
--

ALTER TABLE ONLY crm.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: content_requests content_requests_handled_by_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

--
-- Name: content_requests content_requests_target_class_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_target_class_id_fkey FOREIGN KEY (target_class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: content_requests content_requests_target_course_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_target_course_id_fkey FOREIGN KEY (target_course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: content_requests content_requests_target_department_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_target_department_id_fkey FOREIGN KEY (target_department_id) REFERENCES catalog.departments(id) ON DELETE CASCADE;

--
-- Name: content_requests content_requests_target_section_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_target_section_id_fkey FOREIGN KEY (target_section_id) REFERENCES catalog.sections(id) ON DELETE CASCADE;

--
-- Name: content_requests content_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.content_requests
    ADD CONSTRAINT content_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: course_maintainers course_maintainers_course_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.course_maintainers
    ADD CONSTRAINT course_maintainers_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: course_maintainers course_maintainers_user_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.course_maintainers
    ADD CONSTRAINT course_maintainers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: department_admins department_admins_department_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.department_admins
    ADD CONSTRAINT department_admins_department_id_fkey FOREIGN KEY (department_id) REFERENCES catalog.departments(id) ON DELETE CASCADE;

--
-- Name: department_admins department_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.department_admins
    ADD CONSTRAINT department_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: legal_acceptances legal_acceptances_user_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.legal_acceptances
    ADD CONSTRAINT legal_acceptances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: section_access section_access_section_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.section_access
    ADD CONSTRAINT section_access_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE CASCADE;

--
-- Name: section_access section_access_user_id_fkey; Type: FK CONSTRAINT; Schema: internal; Owner: -
--

ALTER TABLE ONLY internal.section_access
    ADD CONSTRAINT section_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: bookmarks bookmarks_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_question_id_fkey FOREIGN KEY (question_id) REFERENCES catalog.questions(id) ON DELETE CASCADE;

--
-- Name: bookmarks bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: user_achievements user_achievements_achievement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_key_fkey FOREIGN KEY (achievement_key) REFERENCES public.achievements(key) ON DELETE RESTRICT;

--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_changelog_reads user_changelog_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_changelog_reads
    ADD CONSTRAINT user_changelog_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_classes user_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_classes
    ADD CONSTRAINT user_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: user_classes user_classes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_classes
    ADD CONSTRAINT user_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: user_classes user_classes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_classes
    ADD CONSTRAINT user_classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_day_activity user_day_activity_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_activity
    ADD CONSTRAINT user_day_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_question_stats user_question_stats_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_question_stats
    ADD CONSTRAINT user_question_stats_question_id_fkey FOREIGN KEY (question_id) REFERENCES catalog.questions(id) ON DELETE CASCADE;

--
-- Name: user_question_stats user_question_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_question_stats
    ADD CONSTRAINT user_question_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_recent_classes user_recent_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_recent_classes
    ADD CONSTRAINT user_recent_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES catalog.classes(id) ON DELETE CASCADE;

--
-- Name: user_recent_classes user_recent_classes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_recent_classes
    ADD CONSTRAINT user_recent_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id) ON DELETE CASCADE;

--
-- Name: user_recent_classes user_recent_classes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_recent_classes
    ADD CONSTRAINT user_recent_classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_section_stats user_section_stats_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_section_stats
    ADD CONSTRAINT user_section_stats_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE CASCADE;

--
-- Name: user_section_stats user_section_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_section_stats
    ADD CONSTRAINT user_section_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: answer_attempts answer_attempts_question_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.answer_attempts
    ADD CONSTRAINT answer_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES catalog.questions(id) ON DELETE SET NULL;

--
-- Name: answer_attempts answer_attempts_quiz_attempt_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.answer_attempts
    ADD CONSTRAINT answer_attempts_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES quiz.quiz_attempts(id) ON DELETE CASCADE;

--
-- Name: answer_attempts answer_attempts_section_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.answer_attempts
    ADD CONSTRAINT answer_attempts_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE SET NULL;

--
-- Name: flashcard_attempts flashcard_attempts_section_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.flashcard_attempts
    ADD CONSTRAINT flashcard_attempts_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE SET NULL;

--
-- Name: flashcard_attempts flashcard_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.flashcard_attempts
    ADD CONSTRAINT flashcard_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quiz.quizzes(id) ON DELETE SET NULL;

--
-- Name: quiz_attempts quiz_attempts_section_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_attempts
    ADD CONSTRAINT quiz_attempts_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE SET NULL;

--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

--
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES catalog.questions(id) ON DELETE CASCADE;

--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quiz.quizzes(id) ON DELETE CASCADE;

--
-- Name: quizzes quizzes_evaluation_mode_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quizzes
    ADD CONSTRAINT quizzes_evaluation_mode_id_fkey FOREIGN KEY (evaluation_mode_id) REFERENCES quiz.evaluation_modes(id) ON DELETE CASCADE;

--
-- Name: quizzes quizzes_section_id_fkey; Type: FK CONSTRAINT; Schema: quiz; Owner: -
--

ALTER TABLE ONLY quiz.quizzes
    ADD CONSTRAINT quizzes_section_id_fkey FOREIGN KEY (section_id) REFERENCES catalog.sections(id) ON DELETE CASCADE;

--
-- Name: class_syllabi; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.class_syllabi ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: course_classes; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.course_classes ENABLE ROW LEVEL SECURITY;

--
-- Name: course_curricula; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.course_curricula ENABLE ROW LEVEL SECURITY;

--
-- Name: course_plans; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.course_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: department_locations; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.department_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: departments; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: sections; Type: ROW SECURITY; Schema: catalog; Owner: -
--

ALTER TABLE catalog.sections ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_events; Type: ROW SECURITY; Schema: crm; Owner: -
--

ALTER TABLE crm.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: career_exams; Type: ROW SECURITY; Schema: crm; Owner: -
--

ALTER TABLE crm.career_exams ENABLE ROW LEVEL SECURITY;

--
-- Name: enrollments; Type: ROW SECURITY; Schema: crm; Owner: -
--

ALTER TABLE crm.enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_sittings; Type: ROW SECURITY; Schema: crm; Owner: -
--

ALTER TABLE crm.exam_sittings ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: crm; Owner: -
--

ALTER TABLE crm.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: content_requests; Type: ROW SECURITY; Schema: internal; Owner: -
--

ALTER TABLE internal.content_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: course_maintainers; Type: ROW SECURITY; Schema: internal; Owner: -
--

ALTER TABLE internal.course_maintainers ENABLE ROW LEVEL SECURITY;

--
-- Name: department_admins; Type: ROW SECURITY; Schema: internal; Owner: -
--

ALTER TABLE internal.department_admins ENABLE ROW LEVEL SECURITY;

--
-- Name: legal_acceptances; Type: ROW SECURITY; Schema: internal; Owner: -
--

ALTER TABLE internal.legal_acceptances ENABLE ROW LEVEL SECURITY;

--
-- Name: section_access; Type: ROW SECURITY; Schema: internal; Owner: -
--

ALTER TABLE internal.section_access ENABLE ROW LEVEL SECURITY;

--
-- Name: job_runs; Type: ROW SECURITY; Schema: ops; Owner: -
--

ALTER TABLE ops.job_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: job_schedules; Type: ROW SECURITY; Schema: ops; Owner: -
--

ALTER TABLE ops.job_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: job_texts; Type: ROW SECURITY; Schema: ops; Owner: -
--

ALTER TABLE ops.job_texts ENABLE ROW LEVEL SECURITY;

--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_changelog_reads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_changelog_reads ENABLE ROW LEVEL SECURITY;

--
-- Name: user_classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;

--
-- Name: user_day_activity; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_day_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: user_question_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_question_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: user_recent_classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_recent_classes ENABLE ROW LEVEL SECURITY;

--
-- Name: user_section_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_section_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: answer_attempts; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.answer_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: evaluation_modes; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.evaluation_modes ENABLE ROW LEVEL SECURITY;

--
-- Name: flashcard_attempts; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.flashcard_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_attempts; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.quiz_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.quiz_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: quizzes; Type: ROW SECURITY; Schema: quiz; Owner: -
--

ALTER TABLE quiz.quizzes ENABLE ROW LEVEL SECURITY;
RESET ALL;
--> statement-breakpoint
-- The pg-boss 12.37.0 schema, from `pg-boss plans create` with its BEGIN/COMMIT removed, since drizzle-kit
-- already runs each migration in a transaction. Upgrading pg-boss needs a new migration from `pg-boss plans migrate`.
    SET LOCAL lock_timeout = 30000;
    SET LOCAL idle_in_transaction_session_timeout = 30000;
    SELECT pg_advisory_xact_lock(('x' || encode(sha224((current_database() || '.pgboss.pgboss')::bytea), 'hex'))::bit(64)::bigint);
CREATE SCHEMA IF NOT EXISTS pgboss;

    CREATE TYPE pgboss.job_state AS ENUM (
      'created',
      'retry',
      'active',
      'completed',
      'cancelled',
      'failed'
    )
  ;

    CREATE FUNCTION pgboss.job_now()
    RETURNS timestamp with time zone AS
    $$
      SELECT pg_catalog.now();
    $$
    LANGUAGE sql STABLE;
  ;

    CREATE TABLE pgboss.version (
      version int primary key,
      cron_on timestamp with time zone,
      bam_on timestamp with time zone,
      flow_on timestamp with time zone,
      reindex_on timestamp with time zone,
      monitor_backoff_on timestamp with time zone
    )
  ;

    CREATE TABLE pgboss.queue (
      name text NOT NULL,
      policy text NOT NULL,
      retry_limit int NOT NULL,
      retry_delay int NOT NULL,
      retry_backoff bool NOT NULL,
      retry_delay_max int,
      expire_seconds int NOT NULL,
      retention_seconds int NOT NULL,
      deletion_seconds int NOT NULL,
      dead_letter text REFERENCES pgboss.queue (name) CHECK (dead_letter IS DISTINCT FROM name),
      partition bool NOT NULL,
      table_name text NOT NULL,
      deferred_count int NOT NULL default 0,
      blocked_count int NOT NULL default 0,
      queued_count int NOT NULL default 0,
      ready_count int NOT NULL default 0,
      warning_queued int NOT NULL default 0,
      active_count int NOT NULL default 0,
      failed_count int NOT NULL default 0,
      total_count int NOT NULL default 0,
      created_delta int NOT NULL default 0,
      completed_delta int NOT NULL default 0,
      failed_delta int NOT NULL default 0,
      delta_on timestamp with time zone,
      delta_seconds int,
      wait_bins int[],
      run_bins int[],
      ready_oldest_seconds int,
      ready_history int[] NOT NULL default '{}',
      heartbeat_seconds int,
      notify bool NOT NULL DEFAULT false,
      singletons_active text[],
      monitor_claim_on timestamp with time zone,
      monitor_on timestamp with time zone,
      maintain_on timestamp with time zone,
      created_on timestamp with time zone not null default now(),
      updated_on timestamp with time zone not null default now(),
      PRIMARY KEY (name)
    )
  ;

    CREATE TABLE pgboss.schedule (
      name text REFERENCES pgboss.queue ON DELETE CASCADE,
      key text not null DEFAULT '',
      kind text not null DEFAULT 'cron' CHECK (kind IN ('cron', 'rrule')),
      cron text not null,
      timezone text DEFAULT 'UTC',
      data jsonb,
      options jsonb,
      created_on timestamp with time zone not null default now(),
      updated_on timestamp with time zone not null default now(),
      last_job_id uuid,
      PRIMARY KEY (name, key)
    )
  ;

    CREATE TABLE pgboss.subscription (
      event text not null,
      name text not null REFERENCES pgboss.queue ON DELETE CASCADE,
      created_on timestamp with time zone not null default now(),
      updated_on timestamp with time zone not null default now(),
      PRIMARY KEY(event, name)
    )
  ;

    CREATE TABLE pgboss.bam (
      id uuid PRIMARY KEY default gen_random_uuid(),
      name text NOT NULL,
      version int NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      queue text,
      table_name text NOT NULL,
      command text NOT NULL,
      error text,
      created_on timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
      started_on timestamp with time zone,
      completed_on timestamp with time zone
    )
  ;

    CREATE FUNCTION pgboss.job_table_format(command text, table_name text)
    RETURNS text AS
    $$
      SELECT format(
        regexp_replace(
          regexp_replace(command, '\.job\y', '.%1$I', 'g'),
          '\yjob_i(\d+)', '%1$s_i\1', 'g'
        ),
        table_name
      );
    $$
    LANGUAGE sql IMMUTABLE;
  ;

    CREATE FUNCTION pgboss.job_table_run(command text, tbl_name text DEFAULT NULL, queue_name text DEFAULT NULL)
    RETURNS VOID AS
    $$
    DECLARE
      tbl RECORD;
    BEGIN
      IF queue_name IS NOT NULL THEN
        SELECT table_name INTO tbl_name FROM pgboss.queue WHERE name = queue_name;
      END IF;

      IF tbl_name IS NOT NULL THEN
        EXECUTE pgboss.job_table_format(command, tbl_name);
        RETURN;
      END IF;

      EXECUTE pgboss.job_table_format(command, 'job_common');

      FOR tbl IN SELECT table_name FROM pgboss.queue WHERE partition = true
      LOOP
        EXECUTE pgboss.job_table_format(command, tbl.table_name);
      END LOOP;
    END;
    $$
    LANGUAGE plpgsql;
  ;

    CREATE FUNCTION pgboss.job_table_run_async(command_name text, version int, command text, tbl_name text DEFAULT NULL, queue_name text DEFAULT NULL)
    RETURNS VOID AS
    $$
    BEGIN
      IF queue_name IS NOT NULL THEN
        SELECT table_name INTO tbl_name FROM pgboss.queue WHERE name = queue_name;
      END IF;

      IF tbl_name IS NOT NULL THEN
        INSERT INTO pgboss.bam (name, version, status, queue, table_name, command)
        VALUES (
          command_name,
          version,
          'pending',
          queue_name,
          tbl_name,
          pgboss.job_table_format(command, tbl_name)
        );
        RETURN;
      END IF;

      INSERT INTO pgboss.bam (name, version, status, queue, table_name, command)
      SELECT
        command_name,
        version,
        'pending',
        NULL,
        'job_common',
        pgboss.job_table_format(command, 'job_common')
      UNION ALL
      SELECT
        command_name,
        version,
        'pending',
        queue.name,
        queue.table_name,
        pgboss.job_table_format(command, queue.table_name)
      FROM pgboss.queue
      WHERE partition = true;
    END;
    $$
    LANGUAGE plpgsql;
  ;

    CREATE TABLE pgboss.job (
      id uuid not null default gen_random_uuid(),
      name text not null,
      priority integer not null default(0),
      data jsonb,
      state pgboss.job_state not null default 'created',
      retry_limit integer not null default 2,
      retry_count integer not null default 0,
      retry_delay integer not null default 0,
      retry_backoff boolean not null default false,
      retry_delay_max integer,
      expire_seconds int not null default 900,
      deletion_seconds int not null default 604800,
      singleton_key text,
      singleton_on timestamp without time zone,
      group_id text,
      group_tier text,
      start_after timestamp with time zone not null default now(),
      created_on timestamp with time zone not null default now(),
      started_on timestamp with time zone,
      completed_on timestamp with time zone,
      keep_until timestamp with time zone NOT NULL default now() + interval '1209600',
      output jsonb,
      dead_letter text,
      policy text,
      heartbeat_on timestamp with time zone,
      heartbeat_seconds int,
      blocked boolean not null default false,
      blocking boolean not null default false,
      pending_dependencies int not null default 0,
      source_name text,
      source_id uuid,
      source_created_on timestamp with time zone,
      source_retry_count int,
      source_output jsonb,
      source_root_id uuid,
      trace_context jsonb,
      upsert_by_key bool
    ) PARTITION BY LIST (name)
  ;
ALTER TABLE pgboss.job ADD PRIMARY KEY (name, id);

    CREATE TABLE pgboss.job_common (LIKE pgboss.job INCLUDING GENERATED INCLUDING DEFAULTS);

    SELECT pgboss.job_table_run($cmd$ALTER TABLE pgboss.job ADD PRIMARY KEY (name, id)$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT q_fkey FOREIGN KEY (name) REFERENCES pgboss.queue (name) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT dlq_fkey FOREIGN KEY (dead_letter) REFERENCES pgboss.queue (name) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i1 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state = 'created' AND policy = 'short'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i2 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state = 'active' AND policy = 'singleton'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i3 ON pgboss.job (name, state, COALESCE(singleton_key, '')) WHERE state <= 'active' AND policy = 'stately'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i6 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state <= 'active' AND policy = 'exclusive'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i8 ON pgboss.job (name, singleton_key) WHERE state IN ('active', 'retry', 'failed') AND policy = 'key_strict_fifo'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE INDEX job_i10 ON pgboss.job (name, singleton_key, state DESC, created_on, id) INCLUDE (start_after) WHERE state < 'active' AND NOT blocked AND policy = 'key_strict_fifo'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT job_key_strict_fifo_singleton_key_check CHECK (NOT (policy = 'key_strict_fifo' AND singleton_key IS NULL))$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i4 ON pgboss.job (name, singleton_on, COALESCE(singleton_key, '')) WHERE state <> 'cancelled' AND singleton_on IS NOT NULL$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE INDEX job_i11 ON pgboss.job (name, priority DESC, created_on, start_after) WHERE state < 'active' AND NOT blocked$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE INDEX job_i7 ON pgboss.job (name, group_id) WHERE state = 'active' AND group_id IS NOT NULL$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE INDEX job_i9 ON pgboss.job (name, id) WHERE blocking AND state = 'completed'$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE INDEX job_i12 ON pgboss.job (source_root_id) WHERE source_root_id IS NOT NULL$cmd$, 'job_common');
    SELECT pgboss.job_table_run($cmd$CREATE UNIQUE INDEX job_i13 ON pgboss.job (name, singleton_key) WHERE state = 'created' AND upsert_by_key$cmd$, 'job_common');

    ALTER TABLE pgboss.job ATTACH PARTITION pgboss.job_common DEFAULT;
  ;

    CREATE TABLE pgboss.warning (
      id uuid PRIMARY KEY default gen_random_uuid(),
      type text NOT NULL,
      message text NOT NULL,
      data jsonb,
      created_on timestamp with time zone NOT NULL DEFAULT now()
    )
  ;
CREATE INDEX warning_i1 ON pgboss.warning (created_on DESC);

    CREATE TABLE pgboss.queue_stats (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      name text NOT NULL,
      deferred_count int NOT NULL DEFAULT 0,
      queued_count   int NOT NULL DEFAULT 0,
      ready_count    int NOT NULL DEFAULT 0,
      active_count   int NOT NULL DEFAULT 0,
      failed_count   int NOT NULL DEFAULT 0,
      total_count    int NOT NULL DEFAULT 0,
      created_delta   int,
      completed_delta int,
      failed_delta    int,
      delta_seconds   int,
      delta_on        timestamptz,
      wait_bins       int[],
      run_bins        int[],
      ready_oldest_seconds int,
      captured_on timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (id, captured_on)
    ) PARTITION BY RANGE (captured_on)
  ;
CREATE INDEX queue_stats_i1 ON pgboss.queue_stats (name, captured_on DESC) INCLUDE (deferred_count, queued_count, ready_count, active_count, failed_count, total_count);

    DO $$
    DECLARE
      d date;
      i int;
      part_name text;
    BEGIN
      FOR i IN 0..1 LOOP
        d := (pgboss.job_now() AT TIME ZONE 'UTC')::date + i;
        part_name := 'queue_stats_' || to_char(d, 'YYYYMMDD');
        IF NOT EXISTS (
          SELECT 1 FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'pgboss' AND c.relname = part_name
        ) THEN
          EXECUTE format(
            'CREATE TABLE pgboss.%I PARTITION OF pgboss.queue_stats FOR VALUES FROM (%L) TO (%L)',
            part_name,
            to_char(d, 'YYYY-MM-DD') || ' 00:00:00+00',
            to_char(d + 1, 'YYYY-MM-DD') || ' 00:00:00+00'
          );
        END IF;
      END LOOP;
    END;
    $$
  ;

    CREATE TABLE pgboss.job_dependency (
      child_name text NOT NULL,
      child_id uuid NOT NULL,
      parent_name text NOT NULL,
      parent_id uuid NOT NULL,
      PRIMARY KEY (child_name, child_id, parent_name, parent_id)
    )
  ;
CREATE INDEX IF NOT EXISTS job_dep_parent_idx ON pgboss.job_dependency (parent_name, parent_id);

    CREATE TABLE pgboss.instance (
      id uuid PRIMARY KEY,
      name text,
      host text NOT NULL,
      pid int NOT NULL,
      version text NOT NULL,
      node_version text NOT NULL,
      application_name text,
      heartbeat_seconds int NOT NULL,
      supervise bool NOT NULL,
      schedule bool NOT NULL,
      migrate bool NOT NULL,
      persist_queue_stats bool NOT NULL,
      persist_warnings bool NOT NULL,
      pool_max int,
      pool_total int,
      pool_idle int,
      pool_waiting int,
      workers jsonb NOT NULL DEFAULT '[]'::jsonb,
      metrics jsonb,
      config jsonb NOT NULL DEFAULT '{}'::jsonb,
      crash_restarts int NOT NULL DEFAULT 0,
      crash_restarts_since timestamptz,
      started_on timestamptz NOT NULL DEFAULT now(),
      heartbeat_on timestamptz NOT NULL DEFAULT now(),
      stopped_on timestamptz
    )
  ;

    CREATE FUNCTION pgboss.create_queue(queue_name text, options jsonb)
    RETURNS VOID AS
    $$
    DECLARE
      tablename varchar := CASE WHEN options->>'partition' = 'true'
                            THEN 'j' || encode(sha224(queue_name::bytea), 'hex')
                            ELSE 'job_common'
                            END;
      queue_created_on timestamptz;
    BEGIN

      WITH q as (
        INSERT INTO pgboss.queue (
          name,
          policy,
          retry_limit,
          retry_delay,
          retry_backoff,
          retry_delay_max,
          expire_seconds,
          retention_seconds,
          deletion_seconds,
          warning_queued,
          dead_letter,
          partition,
          table_name,
          heartbeat_seconds,
          notify,
          created_on,
          updated_on
        )
        VALUES (
          queue_name,
          options->>'policy',
          COALESCE((options->>'retryLimit')::int, 2),
          COALESCE((options->>'retryDelay')::int, 0),
          COALESCE((options->>'retryBackoff')::bool, false),
          (options->>'retryDelayMax')::int,
          COALESCE((options->>'expireInSeconds')::int, 900),
          COALESCE((options->>'retentionSeconds')::int, 1209600),
          COALESCE((options->>'deleteAfterSeconds')::int, 604800),
          COALESCE((options->>'warningQueueSize')::int, 0),
          options->>'deadLetter',
          COALESCE((options->>'partition')::bool, false),
          tablename,
          (options->>'heartbeatSeconds')::int,
          COALESCE((options->>'notify')::bool, false),
          pgboss.job_now(),
          pgboss.job_now()
        )
        ON CONFLICT DO NOTHING
        RETURNING created_on
      )
      SELECT created_on into queue_created_on from q;

      IF queue_created_on IS NULL OR options->>'partition' IS DISTINCT FROM 'true' THEN
        RETURN;
      END IF;

      EXECUTE format('CREATE TABLE pgboss.%I (LIKE pgboss.job INCLUDING DEFAULTS)', tablename);

      EXECUTE pgboss.job_table_format($cmd$ALTER TABLE pgboss.job ADD PRIMARY KEY (name, id)$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT q_fkey FOREIGN KEY (name) REFERENCES pgboss.queue (name) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT dlq_fkey FOREIGN KEY (dead_letter) REFERENCES pgboss.queue (name) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED$cmd$, tablename);

      EXECUTE pgboss.job_table_format($cmd$CREATE INDEX job_i11 ON pgboss.job (name, priority DESC, created_on, start_after) WHERE state < 'active' AND NOT blocked$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i4 ON pgboss.job (name, singleton_on, COALESCE(singleton_key, '')) WHERE state <> 'cancelled' AND singleton_on IS NOT NULL$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$CREATE INDEX job_i7 ON pgboss.job (name, group_id) WHERE state = 'active' AND group_id IS NOT NULL$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$CREATE INDEX job_i9 ON pgboss.job (name, id) WHERE blocking AND state = 'completed'$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$CREATE INDEX job_i12 ON pgboss.job (source_root_id) WHERE source_root_id IS NOT NULL$cmd$, tablename);
      EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i13 ON pgboss.job (name, singleton_key) WHERE state = 'created' AND upsert_by_key$cmd$, tablename);

      IF options->>'policy' = 'short' THEN
        EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i1 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state = 'created' AND policy = 'short'$cmd$, tablename);
      ELSIF options->>'policy' = 'singleton' THEN
        EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i2 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state = 'active' AND policy = 'singleton'$cmd$, tablename);
      ELSIF options->>'policy' = 'stately' THEN
        EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i3 ON pgboss.job (name, state, COALESCE(singleton_key, '')) WHERE state <= 'active' AND policy = 'stately'$cmd$, tablename);
      ELSIF options->>'policy' = 'exclusive' THEN
        EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i6 ON pgboss.job (name, COALESCE(singleton_key, '')) WHERE state <= 'active' AND policy = 'exclusive'$cmd$, tablename);
      ELSIF options->>'policy' = 'key_strict_fifo' THEN
        EXECUTE pgboss.job_table_format($cmd$CREATE UNIQUE INDEX job_i8 ON pgboss.job (name, singleton_key) WHERE state IN ('active', 'retry', 'failed') AND policy = 'key_strict_fifo'$cmd$, tablename);
        EXECUTE pgboss.job_table_format($cmd$CREATE INDEX job_i10 ON pgboss.job (name, singleton_key, state DESC, created_on, id) INCLUDE (start_after) WHERE state < 'active' AND NOT blocked AND policy = 'key_strict_fifo'$cmd$, tablename);
        EXECUTE pgboss.job_table_format($cmd$ALTER TABLE pgboss.job ADD CONSTRAINT job_key_strict_fifo_singleton_key_check CHECK (NOT (policy = 'key_strict_fifo' AND singleton_key IS NULL))$cmd$, tablename);
      END IF;

      EXECUTE format('ALTER TABLE pgboss.%I ADD CONSTRAINT cjc CHECK (name=%L)', tablename, queue_name);
      EXECUTE format('ALTER TABLE pgboss.job ATTACH PARTITION pgboss.%I FOR VALUES IN (%L)', tablename, queue_name);
    END;
    $$
    LANGUAGE plpgsql;
  ;

    CREATE FUNCTION pgboss.delete_queue(queue_name text)
    RETURNS VOID AS
    $$
    DECLARE
      v_table varchar;
      v_partition bool;
    BEGIN
      
      SELECT table_name, partition
      FROM pgboss.queue
      WHERE name = queue_name
      INTO v_table, v_partition;

      IF v_partition THEN
        EXECUTE format('DROP TABLE IF EXISTS pgboss.%I', v_table);
      ELSE
        EXECUTE format('DELETE FROM pgboss.%I WHERE name = %L', v_table, queue_name);
      END IF;
    
      DELETE FROM pgboss.queue WHERE name = queue_name;
    END;
    $$
    LANGUAGE plpgsql;
  ;
INSERT INTO pgboss.version(version) VALUES ('45');
--> statement-breakpoint
ALTER FUNCTION pgboss.job_now() SET search_path = pgboss, pg_catalog;
ALTER FUNCTION pgboss.job_table_format(text, text) SET search_path = pgboss, pg_catalog;
ALTER FUNCTION pgboss.job_table_run(text, text, text) SET search_path = pgboss, pg_catalog;
ALTER FUNCTION pgboss.job_table_run_async(text, int, text, text, text) SET search_path = pgboss, pg_catalog;
ALTER FUNCTION pgboss.create_queue(text, jsonb) SET search_path = pgboss, pg_catalog;
ALTER FUNCTION pgboss.delete_queue(text) SET search_path = pgboss, pg_catalog;
--> statement-breakpoint
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: version; Type: TABLE DATA; Schema: pgboss; Owner: -
--


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('explorer_1', 'explorer', 1, 'Curioso', 'Completa un quiz in 3 sezioni diverse.', 'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 3, 'compass', 'chart-2', 11, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('explorer_2', 'explorer', 2, 'Esploratore', 'Completa un quiz in 10 sezioni diverse.', 'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 10, 'compass', 'chart-2', 12, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('explorer_3', 'explorer', 3, 'Cartografo', 'Completa un quiz in 25 sezioni diverse.', 'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 25, 'compass', 'chart-2', 13, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('classes_1', 'classes', 1, 'Poliedrico', 'Completa un quiz in 3 insegnamenti diversi.', 'Esplorazione', 'DISTINCT_CLASSES', 'GTE', 3, 'map', 'chart-2', 15, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('classes_2', 'classes', 2, 'Enciclopedico', 'Completa un quiz in 8 insegnamenti diversi.', 'Esplorazione', 'DISTINCT_CLASSES', 'GTE', 8, 'map', 'chart-2', 16, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('wanderer_1', 'wanderer', 1, 'Sconfinato', 'Studia in sezioni di 2 dipartimenti diversi.', 'Esplorazione', 'DISTINCT_DEPARTMENTS', 'GTE', 2, 'global', 'chart-2', 21, true, '2026-09-14 15:51:38.339807+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('perfect_1', 'perfect', 1, 'Trentatré', 'Chiudi un quiz con voto pieno su almeno 10 domande.', 'Padronanza', 'PERFECT_QUIZZES', 'GTE', 1, 'medal-star', 'chart-3', 31, true, '2026-09-14 15:51:38.339807+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('hard_1', 'hard', 1, 'Sotto pressione', 'Rispondi correttamente a 25 domande difficili.', 'Padronanza', 'HARD_CORRECT', 'GTE', 25, 'bolt', 'chart-3', 41, true, '2026-09-14 15:51:38.339807+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('hard_2', 'hard', 2, 'A sangue freddo', 'Rispondi correttamente a 100 domande difficili.', 'Padronanza', 'HARD_CORRECT', 'GTE', 100, 'bolt', 'chart-3', 42, true, '2026-09-14 15:51:38.339807+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('exam_1', 'exam', 1, 'Pronto all''esame', 'Chiudi una simulazione d''esame con almeno 27, su almeno 15 domande.', 'Padronanza', 'EXAM_SIMS_PASSED', 'GTE', 1, 'diploma-verified', 'chart-3', 51, true, '2026-09-14 15:51:38.339807+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('growth_1', 'growth', 1, 'In crescita', 'Migliora di 6 punti dal primo all''ultimo tentativo su una stessa sezione.', 'Progresso', 'MAX_SECTION_IMPROVEMENT', 'GTE', 6, 'graph-up', 'chart-4', 61, true, '2026-09-14 15:51:38.339807+00', 'burst');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('weeks_1', 'weeks', 1, 'Settimana piena', 'Accumula 2 settimane con almeno 3 giorni di studio.', 'Ritmo', 'ACTIVE_WEEKS', 'GTE', 2, 'calendar', 'chart-5', 71, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('weeks_2', 'weeks', 2, 'Mese pieno', 'Accumula 6 settimane con almeno 3 giorni di studio.', 'Ritmo', 'ACTIVE_WEEKS', 'GTE', 6, 'calendar', 'chart-5', 72, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('streak_1', 'streak', 1, 'Filotto', 'Studia 5 giorni di fila.', 'Ritmo', 'BEST_DAY_STREAK', 'GTE', 5, 'fire', 'chart-5', 81, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('hours_1', 'hours', 1, 'Prime ore', 'Accumula 2 ore di studio.', 'Ritmo', 'TOTAL_TIME_MS', 'GTE', 7200000, 'clock-circle', 'chart-5', 91, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('hours_2', 'hours', 2, 'Ore di volo', 'Accumula 10 ore di studio.', 'Ritmo', 'TOTAL_TIME_MS', 'GTE', 36000000, 'clock-circle', 'chart-5', 92, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('hours_3', 'hours', 3, 'Veterano', 'Accumula 40 ore di studio.', 'Ritmo', 'TOTAL_TIME_MS', 'GTE', 144000000, 'clock-circle', 'chart-5', 93, true, '2026-09-14 15:51:38.339807+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('flashcards_1', 'flashcards', 1, 'Schedatore', 'Completa 3 sessioni di flashcard.', 'Metodo', 'FLASHCARD_SESSIONS', 'GTE', 3, 'cardholder', 'chart-1', 101, true, '2026-09-14 15:51:38.339807+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('flashcards_2', 'flashcards', 2, 'Archivista', 'Completa 15 sessioni di flashcard.', 'Metodo', 'FLASHCARD_SESSIONS', 'GTE', 15, 'cardholder', 'chart-1', 102, true, '2026-09-14 15:51:38.339807+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('review_1', 'review', 1, 'Ripasso mirato', 'Rispondi correttamente a 5 domande che avevi salvato nei segnalibri.', 'Metodo', 'BOOKMARKED_THEN_CORRECT', 'GTE', 5, 'bookmark', 'chart-1', 111, true, '2026-09-14 15:51:38.339807+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('contributor_1', 'contributor', 1, 'Contributore', 'Vedi approvata la tua prima proposta di contenuto.', 'Contributo', 'APPROVED_REQUESTS', 'GTE', 1, 'hand-heart', 'brand', 121, true, '2026-09-14 15:51:38.339807+00', 'ribbon');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('contributor_2', 'contributor', 2, 'Redattore', 'Vedi approvate 5 proposte di contenuto.', 'Contributo', 'APPROVED_REQUESTS', 'GTE', 5, 'hand-heart', 'brand', 122, true, '2026-09-14 15:51:38.339807+00', 'ribbon');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('contributor_3', 'contributor', 3, 'Pilastro', 'Vedi approvate 15 proposte di contenuto.', 'Contributo', 'APPROVED_REQUESTS', 'GTE', 15, 'hand-heart', 'brand', 123, true, '2026-09-14 15:51:38.339807+00', 'ribbon');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('founder_1', 'founder', 1, 'Dei primi', 'Sei fra i primi 100 iscritti a TriviaMore.', 'Origine', 'SIGNUP_RANK', 'LTE', 100, 'star', 'muted', 131, true, '2026-09-14 15:51:38.339807+00', 'diamond');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('onboarding_1', 'onboarding', 1, 'Matricola', 'Collega il tuo corso di studi al profilo.', 'Origine', 'ENROLLMENT_DECLARED', 'GTE', 1, 'diploma-verified', 'muted', 130, true, '2026-09-19 16:30:04.793582+00', 'diamond');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('explorer_4', 'explorer', 4, 'Atlante', 'Completa un quiz in 50 sezioni diverse.', 'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 50, 'compass', 'chart-2', 14, true, '2026-10-10 08:18:45.038773+00', 'seal');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('perfect_2', 'perfect', 2, 'Perfezionista', 'Chiudi 5 quiz con voto pieno su almeno 10 domande.', 'Padronanza', 'PERFECT_QUIZZES', 'GTE', 5, 'medal-star', 'chart-3', 32, true, '2026-10-10 08:18:45.038773+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('perfect_3', 'perfect', 3, 'Infallibile', 'Chiudi 20 quiz con voto pieno su almeno 10 domande.', 'Padronanza', 'PERFECT_QUIZZES', 'GTE', 20, 'medal-star', 'chart-3', 33, true, '2026-10-10 08:18:45.038773+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('exam_2', 'exam', 2, 'Collaudato', 'Chiudi 5 simulazioni d''esame con almeno 27, su almeno 15 domande.', 'Padronanza', 'EXAM_SIMS_PASSED', 'GTE', 5, 'diploma-verified', 'chart-3', 52, true, '2026-10-10 08:18:45.038773+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('exam_3', 'exam', 3, 'Pronto a tutto', 'Chiudi 15 simulazioni d''esame con almeno 27, su almeno 15 domande.', 'Padronanza', 'EXAM_SIMS_PASSED', 'GTE', 15, 'diploma-verified', 'chart-3', 53, true, '2026-10-10 08:18:45.038773+00', 'shield');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('weeks_3', 'weeks', 3, 'Trimestre pieno', 'Accumula 12 settimane con almeno 3 giorni di studio.', 'Ritmo', 'ACTIVE_WEEKS', 'GTE', 12, 'calendar', 'chart-5', 73, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('streak_2', 'streak', 2, 'Abitudine', 'Studia 15 giorni di fila.', 'Ritmo', 'BEST_DAY_STREAK', 'GTE', 15, 'fire', 'chart-5', 82, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('streak_3', 'streak', 3, 'Inarrestabile', 'Studia 30 giorni di fila.', 'Ritmo', 'BEST_DAY_STREAK', 'GTE', 30, 'fire', 'chart-5', 83, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('quizzes_1', 'quizzes', 1, 'Rodaggio', 'Completa 10 quiz.', 'Ritmo', 'QUIZZES_COMPLETED', 'GTE', 10, 'bolt', 'chart-5', 94, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('quizzes_2', 'quizzes', 2, 'Allenato', 'Completa 50 quiz.', 'Ritmo', 'QUIZZES_COMPLETED', 'GTE', 50, 'bolt', 'chart-5', 95, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('quizzes_3', 'quizzes', 3, 'Instancabile', 'Completa 200 quiz.', 'Ritmo', 'QUIZZES_COMPLETED', 'GTE', 200, 'bolt', 'chart-5', 96, true, '2026-10-10 08:18:45.038773+00', 'hex');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('flashcards_3', 'flashcards', 3, 'Bibliotecario', 'Completa 50 sessioni di flashcard.', 'Metodo', 'FLASHCARD_SESSIONS', 'GTE', 50, 'cardholder', 'chart-1', 103, true, '2026-10-10 08:18:45.038773+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('review_2', 'review', 2, 'Ripasso sistematico', 'Rispondi correttamente a 25 domande che avevi salvato nei segnalibri.', 'Metodo', 'BOOKMARKED_THEN_CORRECT', 'GTE', 25, 'bookmark', 'chart-1', 112, true, '2026-10-10 08:18:45.038773+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('tasks_1', 'tasks', 1, 'Spuntato', 'Completa 10 task del calendario.', 'Metodo', 'TASKS_DONE', 'GTE', 10, 'checklist', 'chart-1', 115, true, '2026-10-10 08:21:16.75435+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('tasks_2', 'tasks', 2, 'Organizzato', 'Completa 50 task del calendario.', 'Metodo', 'TASKS_DONE', 'GTE', 50, 'checklist', 'chart-1', 116, true, '2026-10-10 08:21:16.75435+00', 'plaque');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('passed_1', 'passed', 1, 'Il primo è fatto', 'Segna nel libretto il primo esame superato.', 'Carriera', 'EXAMS_PASSED', 'GTE', 1, 'notebook', 'chart-4', 141, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('passed_2', 'passed', 2, 'Cinque in tasca', 'Segna nel libretto 5 esami superati.', 'Carriera', 'EXAMS_PASSED', 'GTE', 5, 'notebook', 'chart-4', 142, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('passed_3', 'passed', 3, 'Doppia cifra', 'Segna nel libretto 10 esami superati.', 'Carriera', 'EXAMS_PASSED', 'GTE', 10, 'notebook', 'chart-4', 143, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('passed_4', 'passed', 4, 'Ventina', 'Segna nel libretto 20 esami superati.', 'Carriera', 'EXAMS_PASSED', 'GTE', 20, 'notebook', 'chart-4', 144, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('cfu_1', 'cfu', 1, 'Un anno di crediti', 'Raggiungi 60 CFU con gli esami superati.', 'Carriera', 'CFU_EARNED', 'GTE', 60, 'academic-cap', 'chart-4', 151, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('cfu_2', 'cfu', 2, 'Due anni di crediti', 'Raggiungi 120 CFU con gli esami superati.', 'Carriera', 'CFU_EARNED', 'GTE', 120, 'academic-cap', 'chart-4', 152, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('cfu_3', 'cfu', 3, 'Triennio', 'Raggiungi 180 CFU con gli esami superati.', 'Carriera', 'CFU_EARNED', 'GTE', 180, 'academic-cap', 'chart-4', 153, true, '2026-10-10 08:21:16.75435+00', 'crest');
INSERT INTO public.achievements (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, "position", is_active, created_at, shape) VALUES ('honours_1', 'honours', 1, 'Con lode', 'Supera un esame con 30 e lode.', 'Carriera', 'HONOURS_EARNED', 'GTE', 1, 'crown', 'chart-4', 161, true, '2026-10-10 08:21:16.75435+00', 'crest');

--
-- Data for Name: evaluation_modes; Type: TABLE DATA; Schema: quiz; Owner: -
--

INSERT INTO quiz.evaluation_modes (id, name, description, correct_answer_points, incorrect_answer_points, partial_credit_enabled, created_at, updated_at) VALUES ('e90fbf12-88c8-422a-9a5c-7ad376e1fbfc', 'Standard', 'Modalità di valutazione standard: 1 punto per risposta corretta, punteggi parziali per risposte parziali (no errori). 0 per almeno un errore.', 1, 0, true, '2025-08-17 20:25:55.131+00', '2025-08-17 20:25:55.131+00');
INSERT INTO quiz.evaluation_modes (id, name, description, correct_answer_points, incorrect_answer_points, partial_credit_enabled, created_at, updated_at) VALUES ('6c1fe591-a4ae-42ca-b998-63b4b6622c5c', 'Con penalià', 'Modalità con penalità: 1 punto per risposta corretta, punteggi parziali per risposte parziali, -0.25 per ogni risposta sbagliata.', 1, -0.25, true, '2025-08-18 14:01:21.118+00', '2025-08-18 14:01:21.118+00');
RESET ALL;
--> statement-breakpoint
-- The runtime role is created out of band (scripts/db/dedicated-role.sql), so its grants apply only where it exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app') THEN
    GRANT USAGE ON SCHEMA public, catalog, quiz, internal, crm, ops, pgboss TO trivia_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, catalog, quiz, internal, crm, ops, pgboss TO trivia_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, catalog, quiz, internal, crm, pgboss TO trivia_app;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgboss TO trivia_app;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz, internal, crm, ops
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO trivia_app;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz, internal, crm
      GRANT USAGE, SELECT ON SEQUENCES TO trivia_app;
  END IF;
END $$;
--> statement-breakpoint
-- On a Supabase database the default privileges hand every new table to anon and authenticated.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public, catalog, quiz, internal, crm, ops FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public, catalog, quiz, internal, crm FROM anon, authenticated;
    REVOKE USAGE ON SCHEMA catalog, quiz FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public, catalog, quiz REVOKE ALL ON SEQUENCES FROM anon, authenticated;
  END IF;
END $$;
