-- The v1 catalogue. Reference data, not seed data: copy, icons and thresholds
-- live here so a rebuilt database carries them.
--
-- `family` chains the tiers of one rule; `category` is the section the page
-- groups it under. Both are data, so a new badge — and a new section — is an
-- INSERT from the SQL console, with no deploy.
--
-- Re-runnable. `is_active` is deliberately left out of the update set: a badge
-- retired from the console must stay retired when a later migration refreshes
-- its copy.
INSERT INTO public.achievements
  (key, family, tier, name, description, category, metric, comparator, threshold, icon, accent, position)
VALUES
  -- Esplorazione — premia l'ampiezza, non la ripetizione
  ('explorer_1', 'explorer', 1, 'Curioso',
   'Completa un quiz in 3 sezioni diverse.',
   'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 3, 'compass', 'chart-2', 11),
  ('explorer_2', 'explorer', 2, 'Esploratore',
   'Completa un quiz in 10 sezioni diverse.',
   'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 10, 'compass', 'chart-2', 12),
  ('explorer_3', 'explorer', 3, 'Cartografo',
   'Completa un quiz in 25 sezioni diverse.',
   'Esplorazione', 'DISTINCT_SECTIONS', 'GTE', 25, 'compass', 'chart-2', 13),
  ('classes_1', 'classes', 1, 'Poliedrico',
   'Completa un quiz in 3 insegnamenti diversi.',
   'Esplorazione', 'DISTINCT_CLASSES', 'GTE', 3, 'map', 'chart-2', 15),
  ('classes_2', 'classes', 2, 'Enciclopedico',
   'Completa un quiz in 8 insegnamenti diversi.',
   'Esplorazione', 'DISTINCT_CLASSES', 'GTE', 8, 'map', 'chart-2', 16),
  -- Una sola soglia: al 2026-09-14 solo due dipartimenti hanno domande, quindi
  -- un tier a 4 sarebbe irraggiungibile per costruzione, non difficile.
  ('wanderer_1', 'wanderer', 1, 'Sconfinato',
   'Studia in sezioni di 2 dipartimenti diversi.',
   'Esplorazione', 'DISTINCT_DEPARTMENTS', 'GTE', 2, 'global', 'chart-2', 21),

  -- Padronanza — la qualità, con il minimo di domande dentro la regola
  ('perfect_1', 'perfect', 1, 'Trentatré',
   'Chiudi un quiz con voto pieno su almeno 10 domande.',
   'Padronanza', 'PERFECT_QUIZZES', 'GTE', 1, 'medal-star', 'chart-3', 31),
  ('hard_1', 'hard', 1, 'Sotto pressione',
   'Rispondi correttamente a 25 domande difficili.',
   'Padronanza', 'HARD_CORRECT', 'GTE', 25, 'bolt', 'chart-3', 41),
  ('hard_2', 'hard', 2, 'A sangue freddo',
   'Rispondi correttamente a 100 domande difficili.',
   'Padronanza', 'HARD_CORRECT', 'GTE', 100, 'bolt', 'chart-3', 42),
  ('exam_1', 'exam', 1, 'Pronto all''esame',
   'Chiudi una simulazione d''esame con almeno 27, su almeno 15 domande.',
   'Padronanza', 'EXAM_SIMS_PASSED', 'GTE', 1, 'diploma-verified', 'chart-3', 51),

  -- Progresso — la famiglia che il volume non può comprare
  ('growth_1', 'growth', 1, 'In crescita',
   'Migliora di 6 punti dal primo all''ultimo tentativo su una stessa sezione.',
   'Progresso', 'MAX_SECTION_IMPROVEMENT', 'GTE', 6, 'graph-up', 'chart-4', 61),

  -- Ritmo — abitudine senza punire una settimana di pausa
  ('weeks_1', 'weeks', 1, 'Settimana piena',
   'Accumula 2 settimane con almeno 3 giorni di studio.',
   'Ritmo', 'ACTIVE_WEEKS', 'GTE', 2, 'calendar', 'chart-5', 71),
  ('weeks_2', 'weeks', 2, 'Mese pieno',
   'Accumula 6 settimane con almeno 3 giorni di studio.',
   'Ritmo', 'ACTIVE_WEEKS', 'GTE', 6, 'calendar', 'chart-5', 72),
  ('streak_1', 'streak', 1, 'Filotto',
   'Studia 5 giorni di fila.',
   'Ritmo', 'BEST_DAY_STREAK', 'GTE', 5, 'fire', 'chart-5', 81),
  -- Le soglie del tempo sono in millisecondi, come `quiz_attempts.time_spent`.
  ('hours_1', 'hours', 1, 'Prime ore',
   'Accumula 2 ore di studio.',
   'Ritmo', 'TOTAL_TIME_MS', 'GTE', 7200000, 'clock-circle', 'chart-5', 91),
  ('hours_2', 'hours', 2, 'Ore di volo',
   'Accumula 10 ore di studio.',
   'Ritmo', 'TOTAL_TIME_MS', 'GTE', 36000000, 'clock-circle', 'chart-5', 92),
  ('hours_3', 'hours', 3, 'Veterano',
   'Accumula 40 ore di studio.',
   'Ritmo', 'TOTAL_TIME_MS', 'GTE', 144000000, 'clock-circle', 'chart-5', 93),

  -- Metodo — come si studia, non quanto
  ('flashcards_1', 'flashcards', 1, 'Schedatore',
   'Completa 3 sessioni di flashcard.',
   'Metodo', 'FLASHCARD_SESSIONS', 'GTE', 3, 'cardholder', 'chart-1', 101),
  ('flashcards_2', 'flashcards', 2, 'Archivista',
   'Completa 15 sessioni di flashcard.',
   'Metodo', 'FLASHCARD_SESSIONS', 'GTE', 15, 'cardholder', 'chart-1', 102),
  ('review_1', 'review', 1, 'Ripasso mirato',
   'Rispondi correttamente a 5 domande che avevi salvato nei segnalibri.',
   'Metodo', 'BOOKMARKED_THEN_CORRECT', 'GTE', 5, 'bookmark', 'chart-1', 111),

  -- Contributo — il comportamento che una piattaforma aperta deve produrre
  ('contributor_1', 'contributor', 1, 'Contributore',
   'Vedi approvata la tua prima proposta di contenuto.',
   'Contributo', 'APPROVED_REQUESTS', 'GTE', 1, 'hand-heart', 'brand', 121),
  ('contributor_2', 'contributor', 2, 'Redattore',
   'Vedi approvate 5 proposte di contenuto.',
   'Contributo', 'APPROVED_REQUESTS', 'GTE', 5, 'hand-heart', 'brand', 122),
  ('contributor_3', 'contributor', 3, 'Pilastro',
   'Vedi approvate 15 proposte di contenuto.',
   'Contributo', 'APPROVED_REQUESTS', 'GTE', 15, 'hand-heart', 'brand', 123),

  -- Origine — una volta sola, per nessun merito: l'unico senza colore di famiglia
  ('founder_1', 'founder', 1, 'Dei primi',
   'Sei fra i primi 100 iscritti a TriviaMore.',
   'Origine', 'SIGNUP_RANK', 'LTE', 100, 'star', 'muted', 131)
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
  accent      = EXCLUDED.accent,
  position    = EXCLUDED.position;
