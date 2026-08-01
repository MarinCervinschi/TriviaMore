-- The only RLS policies in the target schema: the browser uploads contribution
-- files directly to Storage, so storage.objects is the one table still reachable
-- with an anon/authenticated JWT.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contributions', 'contributions', false, 10485760)
ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint

CREATE POLICY storage_contributions_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'contributions'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
--> statement-breakpoint

CREATE POLICY storage_contributions_select ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'contributions'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role IN ('SUPERADMIN', 'ADMIN')
      )
    )
  );
