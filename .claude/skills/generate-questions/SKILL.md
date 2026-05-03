---
name: generate-questions
description: Generate quiz questions from notes/study material for a TriviaMore section. Use when the user provides notes, transcripts, slides, or any source material and wants quiz questions generated. Outputs a validated JSON file in pending-questions/ to be uploaded via the admin UI bulk-import. Never writes to the DB.
---

# Generate Questions

You generate quiz questions from material the user provides. The output is **always** a JSON file in `pending-questions/`, never a direct DB write. The user reviews the file, opens the admin UI at `/admin/questions/new?sectionId=...`, and pastes the JSON into the "Import JSON" tab. The section is chosen by the user via the URL — you do not need to know it.

## Prerequisites

The `trivia-more-questions` MCP server must be connected. The only tool you'll use is `mcp__trivia-more-questions__validate_questions`. If it's not available, tell the user to run `/mcp` to verify and stop.

## References

The format and per-type rules live in sibling files. **Read the relevant ones before generating** — don't rely on memory across sessions:

- `references/question-format.md` — shared schema, enums, common rules. Read every session.
- `references/multiple-choice.md` — MC: options (2-40, prefer 4), multi-correct (~10–20%), anti-bias rules, exact match.
- `references/true-false.md` — TF: fixed `["Vero","Falso"]`.
- `references/short-answer.md` — SA: open-ended answers (flashcard / future free-response mode).
- `references/latex.md` — KaTeX, JSON escaping, pitfalls. Read whenever the source material involves math or symbols.

A batch always touches at least `question-format.md` plus the per-type files for the types you'll generate.

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
- One per-type file for each `question_type` you'll produce.
- `references/latex.md` if the material involves math, formulas, code with backslashes, or symbols.

The reference files are the source of truth — keep them open as you draft.

### 3. Generate the batch

Construct the array following the count and mix the user agreed to. Apply the per-type rules (anti-bias, multi-correct quotas, exact-match, fixed TF options, open-ended SA, etc.) from the references — they are not optional.

Quality bar:
- Each question stands alone (no "as we saw above").
- Cover the source material's key concepts; do not invent facts not present.
- Use Italian unless the source material dictates otherwise.
- **Never include `section_id`** — the admin UI injects it from the URL.

### 4. Validate

Call `validate_questions({ questions })`. If `valid: false`, read the errors, fix the offending entries, retry. Do not proceed with errors. After 2 fix attempts, stop and surface the errors to the user.

### 5. Save to disk

Write the validated JSON to `pending-questions/<timestamp>-<short-slug>.json`, where:
- `<timestamp>` is `YYYY-MM-DDTHH-mm-ss` (UTC, colons replaced with hyphens)
- `<short-slug>` is a 2-3 word lowercase kebab summary of the topic, e.g. `tcp-handshake`, `derivata-sigmoide`

Use the standard `Write` tool. Create the directory if it doesn't exist (the `Write` tool handles this).

The file content is the JSON array — pretty-printed (2-space indent), trailing newline.

### 6. Stop

End with a one-line summary:

```
Saved <count> questions to pending-questions/<filename>.
Open /admin/questions/new?sectionId=<your-section-id> → Tab "Import JSON" → paste the file content → Importa domande.
```

Do not open the UI, do not deploy, do not run migrations. The user reviews the file and uploads.

## Constraints

- **Read-only on the DB.** No DB access at all from this skill.
- **No `section_id`** in question objects — UI handles it.
- **One file per batch.** If the user asks for questions on multiple unrelated topics, propose splitting into separate runs (and separate files). Same applies when a single source is large enough to warrant a multi-batch split — agree the split with the user *before* generating.
- **No fabrication.** If the source material is too thin for the requested count, say so and propose a smaller count rather than inventing content.
