---
name: generate-questions
description: Generate quiz questions from notes/study material for a TriviaMore section. Use when the user provides notes, transcripts, slides, or any source material and wants quiz questions generated. Outputs a validated JSON file in pending-questions/ to be uploaded via the admin UI bulk-import. Never writes to the DB.
---

# Generate Questions

You generate quiz questions from material the user provides. The output is **always** a JSON file in `pending-questions/`, never a direct DB write. The user uploads via the existing admin UI to gate everything that reaches the database.

## Prerequisites

The `triviamore-catalog` MCP server must be connected. If its tools aren't available (`mcp__triviamore-catalog__*`), tell the user to run `/mcp` to verify and stop. Do not fall back to raw SQL or Bash queries.

## Workflow

Follow these steps in order. Use TodoWrite to track progress.

### 1. Collect inputs from the user

Ask, in one message, only what you don't already have:
- **Source material**: file path or pasted text
- **Destination**: department / course / section (or "help me pick")
- **Count**: how many questions (default: 10)
- **Type mix**: default 70% MULTIPLE_CHOICE, 20% TRUE_FALSE, 10% SHORT_ANSWER (only ask if user hasn't specified)
- **Difficulty**: default 30% EASY, 50% MEDIUM, 20% HARD (only ask if user hasn't specified)

### 2. Resolve the section

If the user gave a clear destination string, you may still need its UUID. Use:
1. `list_departments` → user picks one
2. `list_courses({ departmentId })` → user picks one
3. (optional) `list_classes({ courseId })` → use this to narrow down when the course has many classes; user picks one
4. `list_sections({ courseId })` for all sections of a course, OR `list_sections({ classId })` for one class only → user picks one (use the `path` field to disambiguate)

Skip the steps the user has already nailed down. End with a confirmed `sectionId` (UUID).

### 3. Get section context

Call `get_section_context({ sectionId })`. From the response:
- Use `section.name` and `section.description` to stay on-topic
- Read `recent_questions` to:
  - **Avoid duplicates** — never generate a question whose stem closely matches an existing one
  - **Match the style**: length, formality, language register (Italian)
  - **Match the structure**: typical option count, use of explanations, length of correct_answer

### 4. Confirm the format

Call `get_question_format()` once per session to lock in the schema. Key rules (re-read each time):
- `content`: 10-2000 chars, trimmed, ends with appropriate punctuation
- `question_type`: `MULTIPLE_CHOICE` | `TRUE_FALSE` | `SHORT_ANSWER`
- `options`:
  - MULTIPLE_CHOICE: 2-6 strings, plausible distractors, prefer 4
  - TRUE_FALSE: always `["Vero", "Falso"]`
  - SHORT_ANSWER: omit or `null`
- `correct_answer`: 1-6 non-empty strings
  - For MULTIPLE_CHOICE, every entry must be present in `options` (exact string match)
  - For TRUE_FALSE: `["Vero"]` or `["Falso"]`
  - For SHORT_ANSWER: the expected concise answer(s)
- `explanation`: optional, ≤1000 chars; include for ~80% of questions, especially when the correct answer needs justification
- `difficulty`: `EASY` | `MEDIUM` | `HARD`
- **Never include `section_id`** — the UI injects it from the URL

### 5. Generate the batch

Construct the array following the count and mix the user agreed to. Quality bar:
- Each question stands alone (no "as we saw above")
- Distractors are plausible, not absurd; ideally one common misconception
- Explanations cite *why*, not just restate the answer
- Use Italian unless the source material dictates otherwise
- Cover the source material's key concepts; do not invent facts not present

### 6. Validate

Call `validate_questions({ questions })`. If `valid: false`, read the errors, fix the offending entries, retry. Do not proceed with errors.

### 7. Save

Call `save_questions_batch({ sectionId, questions })`. Read the response and tell the user (concisely):
- File path (use `relative_path`)
- Count
- The full upload URL: `<dev-host>/admin/questions/new?sectionId=<sectionId>` (Tab "Import JSON" → paste file content → Importa domande)

### 8. Stop

Do not open the UI, do not deploy, do not run migrations. The user reviews and uploads. End with a one-line summary: where the file is and what they do next.

## Constraints

- **Read-only on the DB.** All writes go through the JSON file.
- **No `section_id`** in question objects — UI handles it.
- **One section per batch.** If the user asks for questions across multiple sections, run the workflow once per section, producing separate JSON files.
- **No fabrication.** If the source material is too thin for the requested count, say so and propose a smaller count rather than inventing content.
- If `validate_questions` fails after 2 fix attempts, stop and surface the errors to the user.
