CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
--> statement-breakpoint

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_progress_updated_at BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_user_classes_updated_at BEFORE UPDATE ON public.user_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_content_requests_updated_at BEFORE UPDATE ON public.content_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_departments_updated_at BEFORE UPDATE ON catalog.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_department_locations_updated_at BEFORE UPDATE ON catalog.department_locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON catalog.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON catalog.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_course_classes_updated_at BEFORE UPDATE ON catalog.course_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_sections_updated_at BEFORE UPDATE ON catalog.sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_questions_updated_at BEFORE UPDATE ON catalog.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint
CREATE TRIGGER set_evaluation_modes_updated_at BEFORE UPDATE ON quiz.evaluation_modes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();--> statement-breakpoint

-- Fired by GoTrue on auth.users insert. legal_acceptances rows are written by
-- the application layer instead, so ip_address and user_agent can be taken
-- from the request headers.
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
--> statement-breakpoint

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();--> statement-breakpoint

-- Blocks self role escalation. The superadmin check is inlined here because the
-- is_superadmin() RLS helper is not part of the target schema. The service-role
-- connection is trusted: updateUserRoleFn enforces requireSuperadmin() in the
-- application layer, and auth.uid() is NULL on that connection.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF current_setting('role', true) <> 'service_role'
       AND NOT EXISTS (
         SELECT 1 FROM public.profiles
         WHERE id = (SELECT auth.uid()) AND role = 'SUPERADMIN'
       ) THEN
      RAISE EXCEPTION 'Only superadmins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
--> statement-breakpoint

CREATE TRIGGER protect_profile_role_trigger BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();
