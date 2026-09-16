---
name: achievements
description: How traguardi work in TriviaMore — the catalogue as data, the metric vocabulary, the rollup tables that feed it and the recompute that keeps them honest, plus the backfill/reconcile/replay runbook. Use whenever adding or retiring a badge, adding or changing a metric, touching src/lib/achievements/, the user_stats / user_section_stats / user_question_stats / user_day_activity tables, or anything that writes them on a quiz, flashcard or approved request.
---

# Achievements

Two things are adjustable here and they cost wildly different amounts. Know which one you are doing
before you start.

| | Cost | How |
|---|---|---|
| **A new badge** on an existing metric | an `INSERT`, no deploy | `references/catalogue.md` |
| **A new metric** | schema + write path + recompute + test | `references/new-metric.md` |

## The model

**A rule is a metric and a threshold, never stored SQL.** A row in `public.achievements` is
`metric` + `comparator` (`GTE` / `LTE`) + `threshold`, so evaluating is a comparison in memory and
the whole engine is `src/lib/achievements/rules.ts` — four pure functions, no I/O, identical for a
live unlock and for a replay over every user.

**Metrics are read from rollups, not recomputed.** `readMetricSnapshots` returns all 15 measures for
a user out of four derived tables. Its cost does not grow with how long a student has been studying,
and it does not grow with the number of badges either: a hundred more badges is the same query.

**The history stays authoritative.** `recomputeMetricSnapshots` derives the same measures from
`quiz_attempts` / `answer_attempts` / `flashcard_attempts`. It is not on any request path — it is
what proves the rollups right.

```
src/lib/achievements/
  constants.ts        thresholds shared by the incremental path and the recompute
  rules.ts            meetsRule / progressOf / evaluate — pure, no I/O
  db/rollups.ts       the incremental write, called INSIDE the event's transaction
  db/metrics.ts       readMetricSnapshots — the derived read, what everything uses
  db/recompute.ts     recomputeMetricSnapshots — from history, the reconciler's side
  db/backfill.ts      rebuilds every rollup from history, idempotent
  service.ts          evaluate / replay / reconcile / the page's view models
  rollups.itest.ts    the invariant: rollup == recompute, both directions
```

## Non-negotiables

- **Rollups are written inside the transaction that produced the event.** A counter that moves after
  the commit is a counter that can silently fail to move, and drift in derived state is invisible by
  construction. `applyQuizActivity`, `applyFlashcardActivity` and `applyApprovedRequest` all take a
  `DbOrTx` and the caller passes its `tx`.
- **The evaluation stays *after* the commit.** It must see the committed rows, and a failed unlock
  must never roll back the quiz that earned it. That split is deliberate: rollup inside, evaluate
  outside.
- **Every derived value must be rebuildable.** A counter you cannot recompute is a corrupt value
  waiting to be found. A new metric that cannot be expressed in `recomputeMetricSnapshots` is a
  metric you may not add.
- **A threshold is written once**, in `constants.ts`. The incremental path and the recompute must not
  be able to disagree; if a number appears in both, it is a bug waiting for a retune.
- **Awards are immutable.** `user_achievements` has no revocation path and the FK is
  `on delete restrict`. A badge given by mistake stays given — which is why a rule is worth reading
  twice before the `INSERT`.
- **Reads must stay reads.** `getAchievements` self-heals by default; anything that must not write
  passes `{ heal: false }`, as `pnpm smoke:reads` does.

## Runbook

```
pnpm achievements:backfill              rebuild the rollups from history (idempotent)
pnpm achievements:reconcile             report drift, read-only
pnpm achievements:reconcile --repair    report it, then rebuild
pnpm achievements:replay --dry-run      count what would be awarded
pnpm achievements:replay                award it, silently
pnpm achievements:replay --notify       award it and notify — rarely what you want
```

**After applying a migration that adds rollup columns or tables, run the backfill before anything
reads.** Without it every counter is zero and the page shows a full catalogue of locked medals.

**Drift is expected in two cases and is not a bug:** a question or a section deleted from the
catalogue leaves its counter behind, and a rollup written before a rule was retuned lags until the
next backfill. `reconcile` is how you tell those apart from a real defect.

## Traps

- **A badge inserted without `position`** defaults to 0 and sorts to the front of the catalogue.
  Categories are grouped by name so this no longer splits a tab, but the badge will appear first
  inside its category. Give it a position in its family's range.
- **`family` + `tier` is unique.** Reaching tier III also satisfies I and II, so a first evaluation
  can unlock a whole family at once; only the top tier of each is notified (`notifiableUnlocks`).
- **A metric counting distinct things is not a counter.** `HARD_CORRECT` counts distinct questions,
  not answers — the difference is a badge you can farm by replaying one section. See the shape
  taxonomy in `references/new-metric.md`.
- **The exam sentinel.** `DISTINCT_SECTIONS` excludes the per-class `Exam Simulation` section;
  `DISTINCT_CLASSES` and `DISTINCT_DEPARTMENTS` deliberately include it.
- **A day is `Europe/Rome`**, from `ACTIVITY_ZONE`. The analytics page groups in UTC and the rhythm
  card in the viewer's zone, so a streak here can legitimately differ from one shown there.
- **`LTE` metrics invert every default.** For `SIGNUP_RANK`, 0 is the *best* possible value, so a
  missing one must be `+∞` or the badge goes to everybody. `progressOf` returns `null` for them:
  there is no ramp to draw.
