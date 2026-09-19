-- Origine keeps one shape and one accent across its badges — diamond + muted —
-- because that pairing is the category's identity. Position 130 puts it just
-- before 'Dei primi': declaring a course is the entry rung of this family.
--
-- Re-runnable on the same terms as 0025: is_active stays out of the update set,
-- so a badge retired from the console is not resurrected by a later refresh.
INSERT INTO public.achievements
  (key, family, tier, name, description, category, metric, comparator, threshold, icon, shape, accent, position)
VALUES
  ('onboarding_1', 'onboarding', 1, 'Matricola',
   'Collega il tuo corso di studi al profilo.',
   'Origine', 'ENROLLMENT_DECLARED', 'GTE', 1, 'diploma-verified', 'diamond', 'muted', 130)
ON CONFLICT (key) DO UPDATE SET
  family      = EXCLUDED.family,
  tier        = EXCLUDED.tier,
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  category    = EXCLUDED.category,
  metric      = EXCLUDED.metric,
  comparator  = EXCLUDED.comparator,
  threshold   = EXCLUDED.threshold,
  icon        = EXCLUDED.icon,
  shape       = EXCLUDED.shape,
  accent      = EXCLUDED.accent,
  position    = EXCLUDED.position;
