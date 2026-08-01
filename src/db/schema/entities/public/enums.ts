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
])

export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "TERMS",
  "PRIVACY",
])
