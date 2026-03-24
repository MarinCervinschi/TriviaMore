-- Enums matching the Prisma schema, using snake_case names

CREATE TYPE public.role AS ENUM ('SUPERADMIN', 'ADMIN', 'MAINTAINER', 'STUDENT');
CREATE TYPE public.question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');
CREATE TYPE public.difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE public.course_type AS ENUM ('BACHELOR', 'MASTER');
CREATE TYPE public.quiz_mode AS ENUM ('STUDY', 'EXAM_SIMULATION');
