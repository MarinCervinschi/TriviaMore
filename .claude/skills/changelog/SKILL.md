---
name: changelog
description: How TriviaMore records a release — the technical CHANGELOG.md and the public Italian entry at /news, when each is written, the format both follow, and the traps in the frontmatter parser and the unread-megaphone. Use whenever merging preview into prod, cutting a release, bumping the version, or adding or editing anything under src/content/changelogs/.
---

# Changelog

Two changelogs, two audiences. Writing in the wrong one is the mistake this skill exists to prevent.

| | `CHANGELOG.md` | `src/content/changelogs/<version>.md` |
|---|---|---|
| Audience | whoever works on the code | students using the app |
| Language | English | **Italian** |
| Register | technical — schema, migrations, architecture | what changed for them, in their words |
| Published | the repo | `/news`, and it lights the megaphone |
| Granularity | every notable change, with its issue | the handful worth telling someone about |

A release usually needs **both**. A release that changes nothing a student can see — an internal
refactor, a dependency bump — needs only `CHANGELOG.md`.

## When

**At the merge from `preview` into `prod`, before merging.** That is the moment a change reaches
users, and it is why there is no `Unreleased` section to maintain: everything not yet released is
already described by the git history on `preview`.

Do not write an entry when merging a feature branch into `preview`. Do not append to the released
section afterwards — a correction is a new patch version.

## Writing the technical entry

Build the raw material from the range being released:

```bash
git log prod..preview --pretty='%s' | sort
git log prod..preview --pretty='%s' | sed -E 's/^([a-z]+)(\(.*\))?!?:.*/\1/' | sort | uniq -c | sort -rn
```

Then, in `CHANGELOG.md`, under a `## <version> — <YYYY-MM-DD>` heading:

- Group into **Added / Changed / Fixed / Removed / Security**, in that order, omitting the empty ones.
  Add a **Migrations** section whenever the release carries any, naming which are destructive.
- **Every entry carries its issue or PR** — `(#150)`, `(#159–#166)`. A line without a reference is a
  line nobody can trace back to a reason.
- Describe the change and its consequence, not the commit. "Quiz results are scored from the stored
  verdict rather than re-graded" beats "fix(quiz): score the results page from the stored verdict".
- One commit is not one entry. Twelve commits that build one feature are one entry; one commit that
  fixes a real bug users hit is one entry.
- Lead the section with a one-paragraph summary of what the release is about.

Bump `version` in `package.json` to match, following SemVer: a user-visible feature is a minor, a
fix-only release is a patch, and a breaking change to the data model or the public surface is a major.

## Writing the public entry

A new file `src/content/changelogs/<version>.md`:

```markdown
---
version: 3.1.0
title: Un titolo breve, in italiano
category: new
publishedAt: 2026-08-25
---
Il corpo, in italiano, in markdown.
```

Rules that the code enforces, and what breaks if you ignore them:

- **`version`** must match `\d+\.\d+\.\d+` and **be the same string as the `CHANGELOG.md` heading and
  `package.json`** — it is the key the read-tracking stores per user.
- **`category`** is exactly one of `new`, `improved`, `fixed`. It picks the badge and its colour.
- **`publishedAt`** is `YYYY-MM-DD`, and it is what the list sorts by — not the version.
- The frontmatter parser in `src/lib/changelogs/static.ts` is **deliberately minimal**: a leading
  `---` block of flat `key: value` lines. No nested YAML, no lists, no multi-line values. A malformed
  line throws at build time, which is the good case; the bad case is a value that parses as something
  you did not mean.
- Files are collected by `import.meta.glob(..., { eager: true })`, so a new entry needs a **rebuild**
  to appear. It will not show up on a running dev server's HMR pass alone.

On tone, follow `v3.0.0.md`: say what a student can now do, not what was implemented. No schema, no
migrations, no library names — except where the curiosity is the point, in which case one short
paragraph at the end. Address the reader as *tu*.

## The megaphone rule

Adding a file marks that version **unread for every user** — `getUnreadVersions` compares the full
list against `user_changelog_reads`, so anyone who has not read the new version gets the indicator.

That is the intended behaviour for a real release, and a nuisance for anything less. Do not publish a
public entry for a fix nobody noticed, and never publish one to test the layout: use Storybook or a
local-only file you delete before committing. Once a version is published and read, republishing
under the same version reaches nobody — a real correction needs a new version.

## Checklist

- [ ] `CHANGELOG.md` section added, entries referenced, migrations named
- [ ] `package.json` version bumped to the same version
- [ ] Public entry added under `src/content/changelogs/`, if there is anything a student would notice
- [ ] `pnpm build` passes — it is what proves the frontmatter parses
- [ ] Committed to `preview`, then merged into `prod`
