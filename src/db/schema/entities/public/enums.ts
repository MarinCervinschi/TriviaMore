import { pgEnum } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", [
  "SUPERADMIN",
  "ADMIN",
  "MAINTAINER",
  "STUDENT",
])

export const contentRequestTypeEnum = pgEnum("content_request_type", [
  "NEW_SECTION",
  "NEW_QUESTIONS",
  "REPORT",
  "FILE_UPLOAD",
])

export const contentRequestStatusEnum = pgEnum("content_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "NEEDS_REVISION",
])

export const notificationTypeEnum = pgEnum("notification_type", [
  "REQUEST_STATUS_CHANGED",
  "NEW_REQUEST_RECEIVED",
  "REQUEST_NEEDS_REVISION",
  "REQUEST_REVISED",
  "CONTENT_UPDATED",
  "NEW_SECTION_ADDED",
  "MAINTAINER_ASSIGNED",
  "ACHIEVEMENT_UNLOCKED",
])

export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "TERMS",
  "PRIVACY",
])

// An enum, so a row inserted from the SQL console cannot name a metric the engine does not compute.
export const achievementMetricEnum = pgEnum("achievement_metric", [
  "QUIZZES_COMPLETED",
  "DISTINCT_SECTIONS",
  "DISTINCT_CLASSES",
  "DISTINCT_DEPARTMENTS",
  "PERFECT_QUIZZES",
  "HARD_CORRECT",
  "EXAM_SIMS_PASSED",
  "MAX_SECTION_IMPROVEMENT",
  "ACTIVE_WEEKS",
  "BEST_DAY_STREAK",
  "TOTAL_TIME_MS",
  "FLASHCARD_SESSIONS",
  "BOOKMARKED_THEN_CORRECT",
  "APPROVED_REQUESTS",
  "SIGNUP_RANK",
  "ENROLLMENT_DECLARED",
])

export const achievementComparatorEnum = pgEnum("achievement_comparator", [
  "GTE",
  "LTE",
])

export const jobRunStatusEnum = pgEnum("job_run_status", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
])

export const jobRunTriggerEnum = pgEnum("job_run_trigger", ["MANUAL", "SCHEDULE"])
