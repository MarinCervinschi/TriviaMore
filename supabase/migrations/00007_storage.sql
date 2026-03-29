-- ============================================================
-- Supabase Storage for file contributions
-- Private bucket with RLS: users upload own files, admins read all
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contributions', 'contributions', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Users can upload files to their own folder
CREATE POLICY storage_contributions_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contributions'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY storage_contributions_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contributions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins (SUPERADMIN, ADMIN) can read all files
CREATE POLICY storage_contributions_select_admin ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contributions'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('SUPERADMIN', 'ADMIN')
    )
  );
