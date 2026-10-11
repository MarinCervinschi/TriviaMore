-- Avatars, public so <img src> works anywhere without a signed URL.
--
-- Deliberately WITHOUT an insert/update/delete policy for `authenticated`: the
-- bucket accepts SVG, and an SVG uploaded by the browser is active content we
-- would then serve from our own Storage origin. Every write goes through a
-- server function on the service role instead, which either generates the SVG
-- itself or hands out a one-shot signed upload URL for a raster image. Read is
-- public, which is what `public = true` already grants.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
