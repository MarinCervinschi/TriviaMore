/*
  Warnings:

  - You are about to drop the column `examAverageScore` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `examBestScore` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `examQuizzesTaken` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `examTotalTimeSpent` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `studyAverageScore` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `studyBestScore` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `studyQuizzesTaken` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `studyTotalTimeSpent` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `totalQuestionsStudied` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,sectionId,quizMode]` on the table `progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizMode` to the `progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."progress_userId_sectionId_key";

-- DropIndex
DROP INDEX "public"."users_username_key";

-- AlterTable
ALTER TABLE "public"."progress" DROP COLUMN "examAverageScore",
DROP COLUMN "examBestScore",
DROP COLUMN "examQuizzesTaken",
DROP COLUMN "examTotalTimeSpent",
DROP COLUMN "studyAverageScore",
DROP COLUMN "studyBestScore",
DROP COLUMN "studyQuizzesTaken",
DROP COLUMN "studyTotalTimeSpent",
DROP COLUMN "totalQuestionsStudied",
ADD COLUMN     "averageScore" DOUBLE PRECISION,
ADD COLUMN     "bestScore" DOUBLE PRECISION,
ADD COLUMN     "quizMode" "public"."QuizMode" NOT NULL,
ADD COLUMN     "quizzesTaken" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTimeSpent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "username",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT;

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
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userId_sectionId_quizMode_key" ON "public"."progress"("userId", "sectionId", "quizMode");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
