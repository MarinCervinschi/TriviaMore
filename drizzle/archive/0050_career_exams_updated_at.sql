-- updated_at, as on every other table that carries the column.
CREATE TRIGGER set_career_exams_updated_at BEFORE UPDATE ON crm.career_exams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
