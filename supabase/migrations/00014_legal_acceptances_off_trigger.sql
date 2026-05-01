-- ============================================================
-- Move legal_acceptances writes out of the auth.users trigger.
--
-- Reverts the IF block added in 00011: the trigger now only
-- creates the profile. legal_acceptances rows are inserted from
-- the application layer (signupFn for email/password,
-- recordLegalAcceptanceFn for OAuth users via /legal/accept) so
-- ip_address and user_agent can be captured from request headers.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
