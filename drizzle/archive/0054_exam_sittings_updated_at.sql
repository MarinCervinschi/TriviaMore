-- updated_at, as on every other table that carries the column.
CREATE TRIGGER set_exam_sittings_updated_at BEFORE UPDATE ON crm.exam_sittings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
