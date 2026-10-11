-- Browser uploads get their own raster-only bucket; avatars keeps the SVGs the server generates.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatar-uploads',
  'avatar-uploads',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/svg+xml'] WHERE id = 'avatars';
