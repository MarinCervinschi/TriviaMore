---
name: generate-questions
description: Generate quiz questions from notes/study material for a TriviaMore section. Use when the user provides notes, transcripts, slides, or any source material and wants quiz questions generated. Outputs a validated JSON file in pending-questions/ to be uploaded via the admin UI bulk-import. Never writes to the DB.
---

# Generate Questions

You generate quiz questions from material the user provides. The output is **always** a JSON file in `pending-questions/`, never a direct DB write. The user reviews the file, opens the admin UI at `/admin/questions/new?sectionId=...`, and pastes the JSON into the "Import JSON" tab. The section is chosen by the user via the URL — you do not need to know it.

## Prerequisites

The `trivia-more-questions` MCP server must be connected. You'll use two tools:
- `mcp__trivia-more-questions__check_answer_length_bias` — audits the tmp markdown for the "longest option is the correct one" bias and flags the MC questions to fix (step 5).
- `mcp__trivia-more-questions__compile_questions` — parses the two tmp markdown files, assembles + escapes + validates the question array, and writes the final JSON (step 6).

If they're not available, tell the user to run `/mcp` to verify and stop.

## References

The format and per-type rules live in sibling files. **Read the relevant ones before generating** — don't rely on memory across sessions:

- `references/question-format.md` — shared schema, enums, common rules. Read every session.
- `references/content-quality.md` — depth & distractor-relevance rules: don't make questions trivial, keep distractors in-context. Read every session.
- `references/multiple-choice.md` — MC: options (2-40, prefer 4), multi-correct (~10–20%), anti-bias rules, exact match.
- `references/true-false.md` — TF: fixed `["Vero","Falso"]`.
- `references/short-answer.md` — SA: open-ended answers (flashcard / future free-response mode).
- `references/latex.md` — KaTeX, JSON escaping, pitfalls. Read whenever the source material involves math or symbols.

A batch always touches at least `question-format.md` and `content-quality.md`, plus the per-type files for the types you'll generate.

## Workflow

Follow these steps in order. Use TodoWrite to track progress.

### 1. Collect inputs from the user

Ask, in one message, only what you don't already have:
- **Source material**: file path or pasted text.
- **Type mix**: default 70% `MULTIPLE_CHOICE`, 20% `TRUE_FALSE`, 10% `SHORT_ANSWER`. Override only if the user explicitly asks for a different mix in *this* request (e.g. "solo MC", "no SHORT_ANSWER"). A previous-session override does **not** carry over — re-confirm or fall back to the default.
- **Count and batching**: don't impose a rigid default. The goal is to cover the main topics of the material; let content density drive the count. **Before** generating, estimate roughly how large the batch would be:
  - If small/medium (~roughly ≤ 35 questions), produce a single file.
  - If the source material is large enough that one batch would either saturate the context window or produce an unwieldy file, **propose splitting into multiple batches** (e.g. one per chapter / section) and discuss the split with the user before generating anything. Each batch becomes its own JSON file.
- **Difficulty**: calibrate to the conceptual importance and depth of each topic. Foundational definitions tend toward `EASY`, applied reasoning toward `MEDIUM`, derivations / formulas / non-obvious distinctions toward `HARD`. The 30/50/20 split is a soft target, not a constraint — let the content shape it.

Do **not** ask for the section / department / course — the user picks the destination later by opening the admin URL.

### 2. Read the format references

Mandatory reads:
- `references/question-format.md`
- `references/content-quality.md`
- One per-type file for each `question_type` you'll produce.
- `references/latex.md` if the material involves math, formulas, code with backslashes, or symbols.

The reference files are the source of truth — keep them open as you draft.

### 3. Draft to two tmp markdown files (questions and answers kept apart)

Do **not** write JSON yet. Draft the batch in markdown, with the **correct answers in a separate file from the questions**. This is what makes the review in step 4 a genuine blind solve — the reviewer reads only the questions, never the key.

Pick a working dir `pending-questions/.tmp/<timestamp>-<short-slug>/` (timestamp = `YYYY-MM-DDTHH-mm-ss` UTC, slug = 2–3 word kebab summary) and write two files:

**`questions.md`** — stems and options only. No correct answers, no explanations (an explanation leaks the answer — it goes in the other file). Number questions from 1, label MC/TF options with letters:

```
# Questions — <one-line topic note>

## Q1  [MULTIPLE_CHOICE · MEDIUM]
<stem>
- A) <option>
- B) <option>
- C) <option>
- D) <option>

## Q2  [TRUE_FALSE · EASY]
<declarative claim>
- A) Vero
- B) Falso

## Q3  [SHORT_ANSWER · HARD]
<open prompt>
```

**`answers.md`** — the key for each question, by number:

```
# Answers — <same topic note>

## Q1
correct: C
explanation: <optional — only if it adds something>

## Q2
correct: B

## Q3
correct: <canonical answer>
also-accepted: <variant> | <variant>
```

For multi-correct MC use `correct: A, C`. For SHORT_ANSWER, `correct:` holds the answer text (no letters) and `also-accepted:` the variants.

Apply all the content rules as you draft — the per-type rules (anti-bias, multi-correct quotas, fixed TF options, open-ended SA) and `content-quality.md`. They are not optional, and applying them now means fewer revision rounds:
- Each question stands alone (no "as we saw above").
- **Test the topic, not the source.** Questions are about the subject in its entirety, not about the material itself. Never write "... indicato nel materiale", "secondo il testo/le slide", "as indicated in the material" or similar — the material is where you draw from, not something the reader can see (see `content-quality.md`).
- Cover the source material's key concepts; do not invent facts not present.
- **Not too easy.** Every question must require having studied the material — no general-knowledge gimmes, no answer restated in the stem. Calibrate difficulty to the reasoning actually demanded.
- **In-context distractors.** Every MC option must be the same *kind* of thing as the answer and plausible to a half-prepared student. No out-of-context, absurd, or filler options; no single on-topic answer surrounded by unrelated ones.
- Use Italian unless the source material dictates otherwise.

In markdown you may write LaTeX **naturally** (single backslash, `$...$`) — JSON double-escaping happens only at assembly (step 6), so draft for readability here.

### 4. Blind quality review & revise (mandatory)

A batch is **not done** until it has passed a quality review. This step catches questions that are too easy, have obvious/trivial answers, or have out-of-context distractors.

Spawn the **`question-reviewer`** agent (via the Agent tool, `subagent_type: "question-reviewer"`). Pass it **only the absolute path to `questions.md`** plus a one-line note on the source topic. **Do not give it `answers.md`** — the whole point is that it solves blind.

The reviewer blind-solves each question and returns, per question, its picked option + confidence, plus any flags (`TOO_EASY`, `OBVIOUS_ANSWER`, `GUESSABLE`, `OUT_OF_CONTEXT_DISTRACTOR`, `IMPLAUSIBLE_DISTRACTOR`, `AMBIGUOUS`, `NO_CLEAR_ANSWER`, `DIFFICULTY_MISMATCH`, …) with a concrete suggested fix, ending in `PASS` or `REVISE: <Q-numbers>`. The reviewer flags only what genuinely needs fixing; a clean batch passes untouched, and that's the expected outcome for well-written questions.

Then **reconcile** the report against `answers.md` (the reviewer never saw it):
- Reviewer picked the correct option with `knew-it`/instant confidence and little reasoning → corroborates `TOO_EASY`/`OBVIOUS_ANSWER`. Make it harder.
- Reviewer picked a *wrong* option confidently and with sound reasoning → either the question is genuinely hard (fine) or the key/options are misleading. Check the key against the source; fix whichever is wrong.
- Reviewer flagged `OUT_OF_CONTEXT_DISTRACTOR` / `IMPLAUSIBLE_DISTRACTOR` / `AMBIGUOUS` → fix the options as suggested.

Apply fixes by editing the tmp files (`questions.md` and/or `answers.md`). The agent's suggestions are advice, not orders — if a flag is wrong, keep the question and note why in your final summary. After editing, re-spawn the reviewer **once more** on the updated `questions.md`. Stop after at most **2 review rounds** total even if minor flags remain — note any unresolved flags in the final summary rather than looping further.

Keep the reviewer read-only: it never sees the answers, writes files, or touches the DB.

### 5. Length-bias check (mandatory)

LLM-drafted MC questions have a strong, well-documented bias: **the correct option ends up being the longest one**. Test-takers exploit exactly this — "when in doubt, pick the longest" — so a batch where the right answer is consistently the wordiest teaches the wrong habit and is trivially gameable. `multiple-choice.md` requires length parity (distractors within ±20% of the correct answer); this step verifies it mechanically instead of by eye.

Call `check_answer_length_bias({ questionsPath, answersPath })` on the **same two tmp files** (absolute paths). It measures every option's character length and returns:
- `summary` — `mcCount`, `correctIsLongestCount` / `correctIsLongestPct`, `expectedByChancePct` (the rate you'd expect if length were random), and `systemicBias` (true when the correct option is the longest far more often than chance).
- `flagged` — one entry per MC question where the correct option is longer than **every** distractor, each tagged `severity: "critical"` (correct exceeds the longest distractor by more than 20% — a clear parity break) or `"warning"` (longest but within 20%). Sorted worst-first, with per-option lengths.

**Fix the flagged questions**, prioritising `critical` ones (and treat the whole batch as needing rebalancing if `systemicBias` is true — don't just patch the listed ones, the pattern is systemic). For each, edit `questions.md` to restore parity *without weakening the question*:
- Trim the correct option — drop qualifiers/justification that belong in `explanation` (in `answers.md`), not in the option text.
- And/or beef up the distractors to comparable length and specificity, keeping them plausible and in-context (`content-quality.md`).
- Never "fix" it by making a distractor artificially long or padding with filler — that just moves the tell. The goal is genuine length parity, not disguising it.

Re-run the tool after editing to confirm the flags clear. Stop after at most **2 fix rounds**; if a flag persists because the correct answer genuinely cannot be shortened (e.g. a precise formula), keep it and note it in the final summary. A clean batch (`flagged: []`, `systemicBias: false`) passes untouched.

### 6. Compile to JSON (via the MCP tool)

Call `compile_questions({ questionsPath, answersPath, slug })`:
- `questionsPath` / `answersPath`: **absolute** paths to the two tmp files.
- `slug`: the 2–3 word kebab summary (same one used for the tmp dir).

The tool does the error-prone work deterministically so you never hand-write JSON: it parses the markdown, maps each `correct:` letter to its **exact** option string (byte-for-byte match guaranteed), escapes LaTeX automatically (you wrote single-backslash; it doubles for JSON), validates against the schema, and writes `pending-questions/<timestamp>-<slug>.json`. It never includes `section_id`.

Handle the result:
- `{ ok: true, path, count }` → note the path and count; continue.
- `{ ok: false, stage, errors }` → **nothing was written**. Fix the tmp markdown and retry:
  - `stage: "parse"` → a markdown problem: a `correct:` letter with no matching option, a missing answer entry, an empty stem, options listed on a SHORT_ANSWER, etc.
  - `stage: "schema"` → a content-rule violation: stem too short/long, too few options, `correct_answer` count out of range, etc.
  - `stage: "read"` → a bad path.
  After 2 retries still failing, stop and surface the errors to the user.

### 7. Clean up

The JSON is now written by the tool. Delete the tmp working dir `pending-questions/.tmp/<timestamp>-<short-slug>/`.

### 8. Stop

End with a short summary:

```
Saved <count> questions to pending-questions/<filename>.
Quality review: <PASS | revised N questions — brief note on what changed | unresolved flags: ...>.
Length-bias check: <clean | rebalanced N MC questions | unresolved: ...>.
Open /admin/questions/new?sectionId=<your-section-id> → Tab "Import JSON" → paste the file content → Importa domande.
```

Do not open the UI, do not deploy, do not run migrations. The user reviews the file and uploads.

## Constraints

- **Read-only on the DB.** No DB access at all from this skill.
- **No `section_id`** in question objects — UI handles it.
- **One file per batch.** If the user asks for questions on multiple unrelated topics, propose splitting into separate runs (and separate files). Same applies when a single source is large enough to warrant a multi-batch split — agree the split with the user *before* generating.
- **No fabrication.** If the source material is too thin for the requested count, say so and propose a smaller count rather than inventing content.
- **Draft in markdown, never hand-write the JSON.** Questions and answers stay in separate tmp files (`questions.md` / `answers.md`) until the review passes; the final JSON is produced by `compile_questions` at step 6, not written by hand. Don't manually escape LaTeX or copy `correct_answer` strings — the tool does both correctly.
- **Blind review is mandatory.** Never finish a batch without the step-4 `question-reviewer` pass, and never hand the reviewer `answers.md`. A batch that was never blind-reviewed is not finished.
- **Length-bias check is mandatory.** Never finish a batch without the step-5 `check_answer_length_bias` pass on the tmp markdown, and resolve (or explicitly justify) every `critical` flag. A batch where the correct option is systematically the longest is not finished.
