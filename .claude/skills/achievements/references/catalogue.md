# Adding a badge

The common case, and the cheap one: a badge on a metric that already exists is a row. No deploy, no
migration file if you do it from the console — though a migration is better for anything meant to
survive a rebuild (see below).

## The row

```sql
INSERT INTO public.achievements
  (key, family, tier, name, description, category, metric, comparator, threshold, icon, shape, accent, position)
VALUES
  ('streak_4', 'streak', 4, 'Incrollabile',
   'Studia per 60 giorni di fila.',
   'Ritmo', 'BEST_DAY_STREAK', 'GTE', 60, 'fire', 'burst', 'chart-1', 34);
```

| Column | What it is |
|---|---|
| `key` | stable id, `<family>_<tier>`. Referenced by `user_achievements` forever — never reuse or rename one |
| `family` + `tier` | the chain the dialog shows. **Unique together.** Tier 1 is the entry rung |
| `category` | the page's tab, held as its Italian label so a new one needs no TS map |
| `metric` + `comparator` + `threshold` | the rule. `GTE` unless lower is better |
| `icon` / `shape` / `accent` | the medal. All three fall back rather than throw |
| `position` | catalogue order. **Never leave it at the default 0** |

## The vocabularies

All three maps live in `src/components/achievements/achievement-medal.tsx` and fall back rather than
throw, so an unmapped value still renders — it just renders as something else.

- **`shape`** — one silhouette per category, the second identity channel beside colour:
  `seal` · `shield` · `burst` · `hex` · `plaque` · `ribbon` · `diamond`
- **`accent`** — `chart-1` … `chart-5` · `brand` · `muted`. Adding one means a new field in
  `ACCENTS`, not a new map: the tile's progress ramp reads `achievementStroke` from the same place.
- **`icon`** — `bolt` `bookmark` `calendar` `cardholder` `clock-circle` `compass`
  `diploma-verified` `fire` `global` `graph-up` `hand-heart` `map` `medal-star` `star`.
  A new one is an import plus a line in `ICONS`.

**A category keeps one shape and one accent across all its badges.** That pairing is the identity;
splitting it inside a category makes both channels meaningless.

## The v1 categories

`Esplorazione` · `Padronanza` · `Ritmo` · `Progresso` · `Metodo` · `Contributo` · `Origine`

A new category is just a new string — the page builds its tabs from what the catalogue contains.

## Console or migration

`drizzle/0025_*.sql` is the v1 catalogue and is **re-runnable**: it updates copy and thresholds on
conflict, and deliberately leaves `is_active` out of the update set, so a badge retired from the
console stays retired when a later migration refreshes its text.

Use the console for an experiment. Use a migration for anything that must survive a rebuilt
database — copy, thresholds and icons are reference data, not seed data.

## After the insert

```
pnpm achievements:replay --dry-run     # how many people already qualify
pnpm achievements:replay               # award it, silently
```

**A rule added today has to reach the people who met it months ago**, or the catalogue reads as
broken. Silent is the default on purpose: a backfill would otherwise drop a dozen unread
notifications on every account. `--notify` is for the rare case where the badge is genuinely news.

## Retiring one

Set `is_active = false`. Awards already granted stay — the FK is `on delete restrict` and there is
no revocation path — so the badge keeps showing for whoever earned it and disappears for everyone
else. **Do not delete the row**: `user_achievements` references it.
