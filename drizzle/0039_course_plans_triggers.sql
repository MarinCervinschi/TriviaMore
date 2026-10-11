CREATE TRIGGER set_course_curricula_updated_at BEFORE UPDATE ON catalog.course_curricula
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
--> statement-breakpoint
CREATE TRIGGER set_course_plans_updated_at BEFORE UPDATE ON catalog.course_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
