CREATE TRIGGER set_class_syllabi_updated_at BEFORE UPDATE ON catalog.class_syllabi
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
