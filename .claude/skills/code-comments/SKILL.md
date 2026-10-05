---
name: code-comments
description: >
  Use whenever you write or change a comment anywhere in TriviaMore — a TSDoc `/** */` on a function,
  type, component or column, an inline `//`, a JSX `{/* */}`, a `--` in a SQL migration, a story's
  description. Decides whether the comment should exist at all, which form carries it, and the hard
  limits on length and language. For how the sentence itself should read, see `plain-writing`.
---

# Comments

Two questions, in this order: **should this be written at all**, and **where does it go**. Almost
every comment problem in this repo is the first one.

## Should it exist

The default is no, and the bar is lower than it looks. Comments that explained a real trap have been
deleted by hand in review, keeping only a one-line doc on the export. If a comment you wrote is
deleted, do not put it back. The explanation belongs in the commit message, the PR, the issue or the
chat.

Delete a doc that repeats the identifier. `/** The user's id. */` on `userId` tells the reader
nothing.

A TSDoc earns its place only when it carries something the signature cannot:

1. A precondition or invariant the caller has to respect.
2. The ordering, selection or comparison rule used.
3. What `null` means, and the unit, timezone or format of a value.
4. The `AppError` it throws, and the case that raises it.
5. A cost that is not obvious — a query, a network call, a large payload.

## Where it goes

| What you want to say | Where |
|---|---|
| What the export is or does, when the name does not say it | `/** */`, one line |
| **Why** a line is written this way | a `//` on that line, one line — or the commit message |
| Behaviour that lives in another module | nowhere — it is documented where it lives |
| The story of how you got here, what you tried first | the commit message or the PR |
| Something to fix later | a GitHub issue, not the source |

The split that gets broken most often is the second row. The TSDoc is what the caller sees in the
editor tooltip, and the caller can do nothing with a decision, so a rationale never goes there. Most
rationale stays out of the file altogether. A `//` survives only when the line would look wrong or
redundant without it, so that the next person would "fix" it.

## The hard rules

- **One line.** A TSDoc is one line; so is a `//`. A comment that needs two is either two facts, of
  which only one is the reader's business, or a rationale that belongs in the commit.
- **No paragraphs, no history.** Not "it used to be X", not "the first version did Y", not the
  number that was wrong before. That is the commit message.
- **No redirects.** Not "see `getClassWithSections`", not "handled by #181", not "owned by the
  sync". Say what the code is; the reader who needs the other module will find it.
- **English**, everywhere — TS, SQL migrations, stories, tests. Italian belongs in UI strings and
  nowhere else.
- **No section labels.** `{/* Progress summary */}` above `<ProgressSummary />`, `// Fetch the data`
  above a fetch: delete them.
- **Delete commented-out code.** Git has it.

## By file type

- **TSDoc on an export** — one line, and only per the list above. A component whose props are typed
  and named well needs none.
- **Drizzle schema** — no comment on a column whose name says it. A `//` on a column only when its
  meaning is not its name (a unit, an external identifier, a value that is per-course and not per-row).
- **SQL migration** — a `--` line only for a non-obvious data step. A generated migration needs none.
- **Tests** — the test name is the documentation. A comment inside a test only for a fixture whose
  shape is otherwise baffling.
- **Stories** — a story's `/** */` renders as its description in Storybook. One line, and only if the
  story name does not already say it.

## Examples

```ts
// ✗ restates the code
// Normalise the code before comparing
const key = normaliseCatalogueCode(code);

// ✗ rationale, history and a redirect in a contract
/**
 * The figure a catalogue list shows beside a class. It used to be a bare count, which
 * included the exam sentinel, so a class read 10 outside and 9 inside. See #179.
 */

// ✓ the one thing the signature cannot say
/** Sections of each class this viewer could open, keyed by class id. */
```

```ts
// ✓ the line looks redundant without it, and someone would remove it
// `ilike` reads `_` as a wildcard, and 418 codes contain one.
sql`lower(${courseClasses.code}) = ${code.toLowerCase()}`
```

## Before you call it done

- [ ] Every comment that repeats its code or its name → deleted
- [ ] Every comment longer than one line → cut to one, or moved to the commit message
- [ ] Every rationale in a TSDoc → moved to a `//`, or out of the file
- [ ] Every history ("used to", "first version", "before #N") → moved to the commit message
- [ ] Every redirect to another module or issue → removed
- [ ] Every JSX section label → deleted
- [ ] Any Italian outside a UI string → translated
