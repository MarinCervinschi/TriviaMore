-- updated_at, as on every other table that carries the column.
CREATE TRIGGER set_calendar_events_updated_at BEFORE UPDATE ON crm.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
