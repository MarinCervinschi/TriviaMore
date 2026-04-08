-- Create campus_location enum and migrate courses.location from TEXT to enum

CREATE TYPE public.campus_location AS ENUM ('MODENA', 'REGGIO_EMILIA', 'CARPI', 'MANTOVA');

-- Convert existing text values to enum
UPDATE catalog.courses
SET location = CASE
  WHEN location ILIKE '%modena%' THEN 'MODENA'
  WHEN location ILIKE '%reggio%' THEN 'REGGIO_EMILIA'
  WHEN location ILIKE '%carpi%' THEN 'CARPI'
  WHEN location ILIKE '%mantova%' THEN 'MANTOVA'
  ELSE NULL
END
WHERE location IS NOT NULL;

-- Change column type
ALTER TABLE catalog.courses
  ALTER COLUMN location TYPE public.campus_location
  USING location::public.campus_location;
