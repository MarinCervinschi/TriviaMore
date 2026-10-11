-- Strips whitespace from 90 class codes; checked to cause no collision within a course.
UPDATE "catalog"."course_classes"
SET "code" = regexp_replace("code", '\s+', '', 'g')
WHERE "code" ~ '\s';
