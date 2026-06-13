-- ============================================================
-- Allow role changes performed via the service-role connection.
--
-- The admin server fn updateUserRoleFn already enforces requireSuperadmin()
-- at the application layer and updates profiles through the service-role
-- client, where auth.uid() is NULL — so public.is_superadmin() returned false
-- and the trigger raised "Only superadmins can change roles".
--
-- The trigger still blocks authenticated non-superadmins (RLS already limits
-- them to their own row; this prevents self role escalation). Trusting the
-- service-role connection mirrors the notifications_insert RLS policy.
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_role()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'catalog', 'quiz'
AS $function$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT public.is_superadmin()
       AND current_setting('role', true) <> 'service_role' THEN
      RAISE EXCEPTION 'Only superadmins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
