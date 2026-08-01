-- Reference data, not sample data: startQuizFn falls back to the first
-- evaluation mode and fails without one.

INSERT INTO quiz.evaluation_modes (name, description, correct_answer_points, incorrect_answer_points, partial_credit_enabled)
VALUES (
  'Standard',
  '1 punto per ogni risposta corretta, 0 punti per ogni risposta errata.',
  1.0, 0.0, true
)
ON CONFLICT (name) DO NOTHING;
