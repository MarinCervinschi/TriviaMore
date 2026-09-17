# Achievements — operations

Running the achievement commands against the right database, and knowing which of them you are
expected to run again.

The design behind them is in the [`achievements`](../.claude/skills/achievements/SKILL.md) skill.
This page is the operational half: what to run, when, and where it lands.

## Targeting a database

Every `pnpm <script>` in this repo wraps `infisical run --recursive`, and `.infisical.json` sets
`defaultEnvironment: "dev"`. Infisical injects that environment's secrets **on top of** the process
environment, so an inline variable it also defines is silently discarded:

```bash
DATABASE_URL='<prod>' pnpm achievements:backfill   # runs against LOCAL, and says nothing
```

**`pnpm exec` is what bypasses Infisical.** Combined with the right variable name:

| What you run | Reads | Remote form |
|---|---|---|
| migrations | `SUPABASE_DB_URL` ?? `DATABASE_URL` | `SUPABASE_DB_URL='<url>' pnpm exec drizzle-kit migrate` |
| `scripts/**` (achievements, smoke) | `DATABASE_URL` | `DATABASE_URL='<url>' pnpm exec tsx scripts/achievements/replay.ts` |

The two names are not interchangeable: the scripts go through `getDb()`, which reads `DATABASE_URL`
and nothing else, so `SUPABASE_DB_URL` set in front of a script is simply ignored — and Infisical's
`DATABASE_URL` wins. That combination puts a command you believed was remote onto your laptop's
database, with a plausible-looking result. It has happened.

**Check the result, not the command.** A dry run on a populated database reports a number close to
its profile count, because `founder_1` is `SIGNUP_RANK ≤ 100` and everyone qualifies. `0 traguardi
da assegnare` against an environment you have never replayed means you are talking to the wrong
database.

`PGSSLMODE=disable` is **not** needed here. The pool is built with no `ssl` option, so node-postgres
never negotiates TLS and there is nothing to disable. It is still needed for `pnpm db:dump`, which
runs the Supabase CLI — that bundles its own client and ignores `?sslmode=` in the URL
([supabase/cli#4142](https://github.com/supabase/cli/issues/4142)).

Remote databases are **tailnet-only** (`savvy:54322` is production). Tailscale has to be up, and up
to date.

## The commands

```
pnpm achievements:backfill              rebuild every rollup from history
pnpm achievements:reconcile             report drift between rollups and history, read-only
pnpm achievements:reconcile --repair    report it, then rebuild
pnpm achievements:replay --dry-run      count what would be awarded
pnpm achievements:replay                award it, silently
pnpm achievements:replay --notify       award it and notify
```

### When to run each

Only the first is a setup step. The others recur, on different triggers.

| | Cadence | Run it when |
|---|---|---|
| **backfill** | per event | a migration adds or changes a rollup column; **and** any time the incremental path was bypassed — a bulk import, a manual SQL fix, a restore from backup, a threshold retuned in `constants.ts` |
| **reconcile** | recurring | after any deploy that touches achievements, and periodically as a health check |
| **replay** | per catalogue change | a badge was added — it has to reach the people who already qualify, or the catalogue reads as broken |

`backfill` is idempotent: every statement is an upsert writing **absolute** values recomputed from
history, not deltas, so running it twice converges and running it late self-corrects.

`reconcile` is read-only and exits non-zero on drift, so it drops into a scheduled check with no
extra work. It runs the full recompute over the raw history, so weekly is sensible and every few
minutes is not. A cron here does not conflict with the rule against automatic migrations — it
writes nothing unless given `--repair`.

`replay` is silent by default on purpose: announcing a backfill would drop a dozen unread
notifications on every account. `--notify` is for the rare badge that is genuinely news.

### Drift that is not a bug

`reconcile` reports a difference in two legitimate cases, and telling them apart from a real defect
is the whole point of looking:

- **A deleted question or section.** The rollup counter keeps the contribution; the recompute no
  longer sees it. Awards are immutable anyway, so nothing is revoked — `--repair` realigns the
  counter.
- **A retuned threshold.** A rollup written before the change lags until the next backfill.

Anything else means the incremental write and the recompute have genuinely diverged, and that is a
code bug — start from `src/lib/achievements/rollups.itest.ts`, which asserts they agree.

## First deployment to an environment

Order matters, and two of these steps are load-bearing.

```bash
export URL='postgresql://postgres:<...>@savvy:54322/postgres'

pnpm db:dump                                                  # 1. backup first
SUPABASE_DB_URL="$URL" pnpm exec drizzle-kit migrate          # 2. before the code deploy
DATABASE_URL="$URL" pnpm exec tsx scripts/achievements/backfill-rollups.ts
DATABASE_URL="$URL" pnpm exec tsx scripts/achievements/reconcile.ts
DATABASE_URL="$URL" pnpm exec tsx scripts/achievements/replay.ts --dry-run
DATABASE_URL="$URL" pnpm exec tsx scripts/achievements/replay.ts
```

**Migrate before deploying the code.** `readMetricSnapshots` queries `public.user_stats`; if the app
ships first, the Traguardi page 500s on every open. The dashboard survives — its strip is outside
the loader and not in suspense, deliberately — but the page does not.

**Backfill before the first read.** Without it every counter is zero and the whole catalogue renders
locked. Nothing is corrupted if it slips, since the backfill writes absolute values, but users see a
wrong page in the meantime.

**Replay after the backfill, never before.** It awards from the metrics; on zeroed counters it
awards nothing and reports a confident `0`.

Expect `reconcile` to print `nessuna deriva` and the dry run to report roughly one award per
profile. Neither is optional reassurance — they are how you learn the previous two steps landed
where you meant.
