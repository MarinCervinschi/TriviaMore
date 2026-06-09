# TRUE_FALSE

## Options

- `options`: **always** `["Vero", "Falso"]` — exactly these two strings, in this order. No translations, no variants.

## correct_answer

- Either `["Vero"]` or `["Falso"]`. Single-element array, exact match of one of the options.

## Stem (`content`)

- Phrase as a single declarative claim, not a question. *"Il sole è una stella."* — not *"È vero che il sole è una stella?"*.
- The claim must be unambiguously decidable from the source material. If it depends on context the user can't see, rewrite or skip.
- Avoid double negatives ("non è vero che X non è Y").
- Avoid trivially obvious truths and absurd falsehoods. The interesting space is plausible-but-wrong claims and counter-intuitive truths.
- For `MEDIUM`/`HARD`, prefer claims that flip a single quantifier, condition, or constant — that's where users actually learn.

## Explanation

- Optional. Add one only when the *why* isn't obvious from the claim itself — e.g. when `Falso` hinges on a specific error worth naming, or when a counter-intuitive `Vero` deserves a one-line justification. A bare `Vero`/`Falso` is fine when the claim is self-explanatory.

## Example

```json
{
  "content": "La derivata di $\\sin(x)$ è $-\\cos(x)$.",
  "question_type": "TRUE_FALSE",
  "options": ["Vero", "Falso"],
  "correct_answer": ["Falso"],
  "explanation": "La derivata di $\\sin(x)$ è $\\cos(x)$. Il segno negativo compare invece nella derivata di $\\cos(x)$, che è $-\\sin(x)$.",
  "difficulty": "EASY"
}
```
