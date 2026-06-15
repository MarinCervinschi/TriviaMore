# Question Format — shared rules

Re-read this every session before generating. Type-specific rules live in the sibling files; LaTeX rules live in `latex.md`.

## Output shape

An array of question objects. The admin UI injects `section_id` from the URL — **never include `section_id`** in the JSON.

## Enums

- `question_type`: `MULTIPLE_CHOICE` | `TRUE_FALSE` | `SHORT_ANSWER`
- `difficulty`: `EASY` | `MEDIUM` | `HARD`

## Field rules (apply to all types)

- `content`: 10–2000 chars, trimmed, ends with appropriate punctuation. Each question stands alone — no "as we saw above".
- `options`: **always a flat array of plain strings**, never objects like `{id, text}`. Presence/shape depends on type — see the per-type references.
- `correct_answer`: array of 1–6 non-empty strings. Shape depends on type.
- `explanation`: optional, ≤1000 chars. Include only when the *why* adds something the correct answer doesn't already convey — e.g. a non-obvious justification, a common misconception to flag, or a step a learner might miss. Skip it freely otherwise; an empty/missing explanation is fine. Don't restate the answer.
- `difficulty`: pick per question.

## Default mix (only ask the user if not specified)

- Type mix: 70% `MULTIPLE_CHOICE`, 20% `TRUE_FALSE`, 10% `SHORT_ANSWER`
- Difficulty mix: 30% `EASY`, 50% `MEDIUM`, 20% `HARD`

## Quality bar (all types)

- Use Italian unless the source material dictates otherwise.
- Cover the source material's key concepts. Do not invent facts not present.
- **Test the topic, not the source.** Each question stands on its own about the subject — never reference the material itself (*"come indicato nel materiale"*, *"secondo il testo/le slide"*, *"as indicated in the material"*). The material is where you draw from, not something the reader can see. See `content-quality.md`.
- Match the style implied by the source material (length, formality, register).
- Avoid restating the same fact in two different questions of the same batch.

## Per-type rules

- `references/multiple-choice.md` — options, multi-correct, anti-bias, exact match
- `references/true-false.md` — fixed options, justification
- `references/short-answer.md` — concise expected answers, variants
- `references/latex.md` — KaTeX, JSON escaping, pitfalls
