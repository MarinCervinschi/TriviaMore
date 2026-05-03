# MULTIPLE_CHOICE

## Options

- `options`: 2–40 strings (DB cap), **prefer 4**. Use higher counts only when the source material genuinely lists many parallel items (e.g. *"contrassegnare tutte le affermazioni corrette"* style questions covering 6–10 facts).
- All options plausible. No filler/absurd distractors.
- At least one distractor should reflect a common misconception about the topic.

## correct_answer

- 1–6 strings. **Each entry must be a byte-for-byte exact match** of one of the strings in `options` — same whitespace, same LaTeX, same punctuation. Scoring compares strings literally; any drift makes the answer un-scoreable.
- For LaTeX, copy-paste the exact option string into `correct_answer`. Do not retype, do not swap `\frac` for `\dfrac`, do not reformat spaces.

## Multi-correct questions (~10–20% of MC)

A small fraction of MC questions should have **more than one correct answer** (`correct_answer.length > 1`). Use them sparingly — they are harder and easy to write badly.

When using:
- The stem must signal it. Plural phrasing: *"Quali delle seguenti affermazioni sono vere riguardo a X?"*, *"Indica tutte le proprietà che..."*. Never use a singular *"Qual è..."*.
- Mark **2–3 correct options** out of 4 (rarely 4 of 5). Leaving only 1 correct in a stem phrased as "quali" is misleading.
- Each correct option must stand on its own — none should be a paraphrase of another. The user must be able to evaluate each independently.
- Distractors should still be plausible; don't pad to fill the option count.

## Anti-bias: avoid the "longest answer is correct" pattern

Test-takers learn to pick the longest, most elaborate, or most-qualified option. Do not let the data train that habit.

Rules:
- **Length parity**: the correct answer must not be systematically the longest. Aim for distractors of comparable length and specificity (±20% character count is a reasonable target).
- **Specificity parity**: if the correct answer adds qualifiers ("solo se", "tranne nei casi in cui"), at least one distractor should add similar-looking qualifiers.
- **Position rotation**: vary which index holds the correct answer across the batch. Avoid stretches where the correct answer is always at position 0 or always last.
- **Trick distractors are welcome**: a distractor that is *almost* right (off by a sign, a constant, a quantifier, an exception) teaches more than an obviously wrong one. Use them especially for `MEDIUM`/`HARD`.
- **Don't telegraph with grammar**: every option must be grammatically consistent with the stem (gender, number, verb agreement). A grammatically odd option is a giveaway.

If you find yourself writing a 30-word correct answer and three 5-word distractors, rewrite — either trim the correct answer or beef up the distractors with comparable detail.

## Example (multi-correct + anti-bias)

```json
{
  "content": "Quali delle seguenti funzioni di attivazione hanno output strettamente compreso in $(0, 1)$?",
  "question_type": "MULTIPLE_CHOICE",
  "options": [
    "$\\sigma(x) = \\dfrac{1}{1 + e^{-x}}$",
    "$\\tanh(x) = \\dfrac{e^x - e^{-x}}{e^x + e^{-x}}$",
    "$\\text{softmax}(x)_i = \\dfrac{e^{x_i}}{\\sum_j e^{x_j}}$",
    "$\\text{ReLU}(x) = \\max(0, x)$"
  ],
  "correct_answer": [
    "$\\sigma(x) = \\dfrac{1}{1 + e^{-x}}$",
    "$\\text{softmax}(x)_i = \\dfrac{e^{x_i}}{\\sum_j e^{x_j}}$"
  ],
  "explanation": "Sigmoide e softmax mappano in $(0,1)$. $\\tanh$ ha codominio $(-1,1)$; ReLU è non negativa ma illimitata superiormente.",
  "difficulty": "MEDIUM"
}
```
