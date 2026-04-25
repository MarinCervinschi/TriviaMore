-- ============================================================
-- Extend handle_new_user() to record legal acceptances
--
-- When a user registers via the email/password form, the client
-- passes terms_version and privacy_version inside
-- raw_user_meta_data. This trigger reads those fields and inserts
-- the matching legal_acceptances rows inside the same transaction
-- that creates the profile. OAuth sign-ups do not pass these
-- fields; those users are caught by the consent guard on first
-- authenticated route and accept via /legal/accept.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_terms   TEXT := NEW.raw_user_meta_data->>'terms_version';
  v_privacy TEXT := NEW.raw_user_meta_data->>'privacy_version';
BEGIN
  INSERT INTO public.profiles (id, name, email, image)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  IF v_terms IS NOT NULL AND v_privacy IS NOT NULL THEN
    INSERT INTO public.legal_acceptances (user_id, document_type, version)
    VALUES
      (NEW.id, 'TERMS',   v_terms),
      (NEW.id, 'PRIVACY', v_privacy);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
