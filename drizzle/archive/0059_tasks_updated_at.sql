-- updated_at, as on every other table that carries the column.
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON crm.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
