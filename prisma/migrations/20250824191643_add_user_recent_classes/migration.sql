-- CreateTable
CREATE TABLE "public"."user_recent_classes" (
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "lastVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_recent_classes_pkey" PRIMARY KEY ("userId","classId")
);

-- AddForeignKey
ALTER TABLE "public"."user_recent_classes" ADD CONSTRAINT "user_recent_classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_recent_classes" ADD CONSTRAINT "user_recent_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
