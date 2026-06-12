-- ============================================================
-- Notification type fired when an admin assigns a user as
-- maintainer of a course (manual promotion flow).
-- ============================================================

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'MAINTAINER_ASSIGNED';
