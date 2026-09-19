# Adding a metric

The expensive case. A metric is not a badge: it is a new measure the engine has to compute two
independent ways — incrementally from an event, and from scratch out of history — and the test that
proves they agree.

**Do all four, in this order. Three of four is how drift gets in.**

## 1. Pick the shape

This is the decision that determines the work. Ask what the measure needs, not what it is called.

| Shape | Looks like | Where it lives | Examples |
|---|---|---|---|
| **Counter** | `+= n`, order-independent | a column on `user_stats` | `QUIZZES_COMPLETED`, `TOTAL_TIME_MS` |
| **Set** | "how many *distinct* X" | a row per X, plus a counter moved only when the row flips | `HARD_CORRECT`, `BOOKMARKED_THEN_CORRECT` |
| **Partitioned rollup** | "per section / per week, then aggregate" | a row per partition, aggregated on read | `DISTINCT_SECTIONS`, `MAX_SECTION_IMPROVEMENT` |
| **Calendar** | streaks, active periods | `user_day_activity`, windowed on read | `BEST_DAY_STREAK`, `ACTIVE_WEEKS` |
| **Immutable** | fixed when the user is created | a column, written once | `SIGNUP_RANK` |

**A "distinct" metric is never a counter.** Incrementing on every event counts answers, not
questions, and the badge becomes farmable by replaying one section. The set table is what makes the
counter truthful: `markQuestions` uses `onConflictDoUpdate` with a `setWhere`, so a row already
flipped is not returned and the counter does not move.

**Prefer computing on read over keeping state** when the source is small. Streaks used to be a
state machine; they are now a window over `user_day_activity`, which is ~365 rows a year. One less
thing to keep in sync, and one less class of drift.

## 2. The enum and the vocabulary

- Add the value to `achievementMetricEnum` in `src/db/schema/entities/public/enums.ts`, then
  `pnpm db:generate --name add_<metric>_metric`. Adding an enum value is a plain schema edit;
  **removing one is not** — see the `drizzle-schema` skill.
- Any threshold the metric needs goes in `src/lib/achievements/constants.ts`, never inline. Both
  computations import it.
- If the raw number does not read well to a human, extend `formatMetricValue` in `format.ts` —
  today only `TOTAL_TIME_MS` needs it, and it has a unit test.
- New tables or columns follow the `drizzle-schema` skill in full: `.enableRLS()`, explicit FK
  names, `mode: "string"` timestamps.

## 3. The incremental write

In `src/lib/achievements/db/rollups.ts`, inside the `apply*Activity` function for the event that
moves it. It runs in the caller's transaction and takes `DbOrTx` first.

Two rules that have already cost a bug each:

- **Statements on one transaction are sequential.** A transaction is one connection; `Promise.all`
  over two writes interleaves or throws.
- **The counter moves by what the write actually changed**, not by what you were about to write.
  Use `RETURNING` and count the rows, exactly as `markQuestions` does.

If the metric belongs to an event with no rollup path yet, add the `apply*` function and call it
from that service's transaction — and if the service has no transaction, give it one.

## 4. The recompute

In `src/lib/achievements/db/recompute.ts`, as a CTE producing the same column name. This is the
authority: if you cannot express the metric here, **do not add the metric** — you would be creating
a number nobody can ever verify or rebuild.

Then extend `src/lib/achievements/db/backfill.ts` so a rebuild populates it, and check the mapping
in `toUserMetrics` (`db/metrics.ts`) — **both queries map through it**, which is what stops them
disagreeing about a null. Mind the default: `?? 0` is right for "higher is better" and catastrophic
for an `LTE` metric, where 0 is the best possible value.

## 5. The test

A case in `src/lib/achievements/rollups.itest.ts`, covering **both directions**:

- after `backfillRollups`, rollup == recompute
- after the incremental `apply*Activity`, rollup == recompute

That equality is the entire basis for serving reads from derived tables. Exercise the case that
distinguishes the shape — for a set metric, the same thing twice must count once.

Run it with `pnpm test:db` (needs `supabase start`; each test runs in a rolled-back transaction).

## 6. Ship it

```
pnpm db:migrate                      # by hand, never from a deploy hook
pnpm achievements:backfill           # or the new column is zero for everyone
pnpm achievements:reconcile          # expect: nessuna deriva
```

Only then insert badges that use it (`references/catalogue.md`) and `pnpm achievements:replay`.

## Checklist

- [ ] value added to `achievementMetricEnum`, migration generated and read
- [ ] thresholds in `constants.ts`, imported by both computations
- [ ] rollup column/table, following `drizzle-schema`
- [ ] incremental write in `db/rollups.ts`, inside the event's transaction
- [ ] CTE in `db/recompute.ts`
- [ ] statement in `db/backfill.ts`
- [ ] mapped in `toUserMetrics`, with the right null default for its comparator
- [ ] `formatMetricValue` if the raw number is unreadable
- [ ] both directions covered in `rollups.itest.ts`
- [ ] migration applied by hand, backfill run, reconcile clean
