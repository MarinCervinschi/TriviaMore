-- updated_at, as on every other table that carries the column.
CREATE TRIGGER set_job_schedules_updated_at BEFORE UPDATE ON ops.job_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
