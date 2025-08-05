-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'MAINTAINER', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."CourseType" AS ENUM ('BACHELOR', 'MASTER');

-- CreateEnum
CREATE TYPE "public"."QuizMode" AS ENUM ('STUDY', 'EXAM_SIMULATION');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department_admins" (
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "department_admins_pkey" PRIMARY KEY ("userId","departmentId")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "courseType" "public"."CourseType" NOT NULL DEFAULT 'BACHELOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_maintainers" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_maintainers_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "classYear" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "classId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."section_access" (
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_access_pkey" PRIMARY KEY ("userId","sectionId")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT[],
    "explanation" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quizzes" (
    "id" TEXT NOT NULL,
    "timeLimit" INTEGER,
    "sectionId" TEXT NOT NULL,
    "evaluationModeId" TEXT NOT NULL,
    "quizMode" "public"."QuizMode" NOT NULL DEFAULT 'STUDY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "timeSpent" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answer_attempts" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT[],
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "answer_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookmarks" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "public"."user_classes" (
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_classes_pkey" PRIMARY KEY ("userId","classId")
);

-- CreateTable
CREATE TABLE "public"."progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "totalQuestionsStudied" INTEGER NOT NULL DEFAULT 0,
    "studyQuizzesTaken" INTEGER NOT NULL DEFAULT 0,
    "studyAverageScore" DOUBLE PRECISION,
    "studyBestScore" DOUBLE PRECISION,
    "studyTotalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "examQuizzesTaken" INTEGER NOT NULL DEFAULT 0,
    "examAverageScore" DOUBLE PRECISION,
    "examBestScore" DOUBLE PRECISION,
    "examTotalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "improvementRate" DOUBLE PRECISION,
    "consistencyScore" DOUBLE PRECISION,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluation_modes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "correctAnswerPoints" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "incorrectAnswerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "partialCreditEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "evaluation_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "public"."departments"("code");

-- CreateIndex
CREATE INDEX "departments_position_idx" ON "public"."departments"("position");

-- CreateIndex
CREATE INDEX "courses_position_idx" ON "public"."courses"("position");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_departmentId_key" ON "public"."courses"("code", "departmentId");

-- CreateIndex
CREATE INDEX "classes_position_idx" ON "public"."classes"("position");

-- CreateIndex
CREATE INDEX "classes_classYear_idx" ON "public"."classes"("classYear");

-- CreateIndex
CREATE UNIQUE INDEX "classes_code_courseId_key" ON "public"."classes"("code", "courseId");

-- CreateIndex
CREATE INDEX "sections_position_idx" ON "public"."sections"("position");

-- CreateIndex
CREATE INDEX "questions_sectionId_idx" ON "public"."questions"("sectionId");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "public"."questions"("difficulty");

-- CreateIndex
CREATE INDEX "questions_questionType_idx" ON "public"."questions"("questionType");

-- CreateIndex
CREATE INDEX "quizzes_sectionId_idx" ON "public"."quizzes"("sectionId");

-- CreateIndex
CREATE INDEX "quizzes_quizMode_idx" ON "public"."quizzes"("quizMode");

-- CreateIndex
CREATE INDEX "quizzes_evaluationModeId_idx" ON "public"."quizzes"("evaluationModeId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_quizId_questionId_key" ON "public"."quiz_questions"("quizId", "questionId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "public"."quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "public"."quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_completedAt_idx" ON "public"."quiz_attempts"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "answer_attempts_quizAttemptId_questionId_key" ON "public"."answer_attempts"("quizAttemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userId_sectionId_key" ON "public"."progress"("userId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_modes_name_key" ON "public"."evaluation_modes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."department_admins" ADD CONSTRAINT "department_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department_admins" ADD CONSTRAINT "department_admins_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_maintainers" ADD CONSTRAINT "course_maintainers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_maintainers" ADD CONSTRAINT "course_maintainers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_access" ADD CONSTRAINT "section_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_access" ADD CONSTRAINT "section_access_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_evaluationModeId_fkey" FOREIGN KEY ("evaluationModeId") REFERENCES "public"."evaluation_modes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_questions" ADD CONSTRAINT "quiz_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_attempts" ADD CONSTRAINT "answer_attempts_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "public"."quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_attempts" ADD CONSTRAINT "answer_attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_classes" ADD CONSTRAINT "user_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_classes" ADD CONSTRAINT "user_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress" ADD CONSTRAINT "progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress" ADD CONSTRAINT "progress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
