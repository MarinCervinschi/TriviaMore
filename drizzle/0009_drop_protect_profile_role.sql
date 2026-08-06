-- Drops the protect_profile_role trigger and function. It was a legacy RLS /
-- PostgREST-era guard against self role escalation: it only ever passed for a
-- service_role connection or a superadmin identified by auth.uid(). Under the
-- server-first model the app connects as trivia_app (role GUC 'none', auth.uid()
-- NULL) and PostgREST is closed, so the trigger has no threat model left and
-- blocks the only legitimate writer. Its body still called is_superadmin(),
-- dropped in 0005, so every profiles.role UPDATE was already erroring.
-- Role changes are now authorized entirely in the application layer
-- (updateUserRole → requireSuperadmin()).
DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;--> statement-breakpoint
DROP FUNCTION IF EXISTS public.protect_profile_role();
