# Changelog

Notable changes to TriviaMore, written for people working on the code. The user-facing release
notes are separate: they live in `src/content/changelogs/` and are published at
[/news](https://www.trivia-more.it/news).

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), with one rule borrowed
from [Common Changelog](https://common-changelog.org/): every entry carries the issue or PR it came
from, so a line here leads back to the reasoning behind it. There is deliberately **no `Unreleased`
section** — an entry is written when `preview` merges into `prod`, which is the moment a change
reaches users, and the git history covers everything before that.

Versions follow [Semantic Versioning](https://semver.org/).

## 3.1.0 — 2026-08-25

The server-first rewrite, the progress hub, and the move off Vercel. Everything the app reads now
goes through Drizzle on a direct connection, and what it records about a study session survives the
content it was recorded against.

### Added

- **Progress hub at `/user/progress`** — a metric explorer (four metrics × study/exam split × four
  time windows), a per-course rollup tree, a mastery panel with per-difficulty accuracy and weak/strong
  sections, and a study-rhythm block with streaks, active days and time-of-day. Detail pages per course,
  insegnamento and section, plus the full attempt log at `/user/progress/history`. (#150, #159–#166, #168)
- **Immutable analytics snapshots** — `quiz_attempts.section_id`/`quiz_mode` and
  `answer_attempts.section_id`/`difficulty`/`question_type`/`is_correct` are frozen at submission, so
  deleting a question or a section no longer rewrites a student's history. Quizzes are graded
  server-side. (#159, #160)
- **Flashcard sessions** are recorded and feed the activity heatmap, which previously ignored them. (#161)
- **Structured logging to Seq** — a CLEF shipper, one canonical log line per request, database query
  timing with pool-saturation reporting, and browser errors proxied through `/api/log` so the ingestion
  key never reaches the bundle. (#91, `docs/OBSERVABILITY.md`)
- **One `DataTable`** on TanStack Table v9, with faceted and inline filters, an include/exclude operator
  encoded in the URL, and sorting and pagination in search params. Adopted by all 19 tables.
- **A chart catalogue** on Recharts 3, on the `--chart-*` ramp and its `-ink` text half.
- **Application-layer section access gate** (`src/lib/auth/checks.ts`), replacing the `can_access_section`
  RLS helper. (#89)
- **Two test tiers** — offline unit (`pnpm test`) and database-backed integration in a rolled-back
  transaction (`pnpm test:db`) — plus smoke scripts for every migrated read path and the quiz write
  paths. (#109)
- **Storybook** for every `ui/` primitive and shared component, including those behind a server function.

### Changed

- **Server-first architecture.** Data access is `createServerFn` → service → `db/`, on Drizzle over a
  persistent `pg` pool. supabase-js is now only auth and storage; the browser never queries the database.
  (#87, #88)
- **RLS no longer filters reads.** The app connects as a privileged role, so every narrowing a policy
  used to do is now an explicit where clause or an authorization call. (#89)
- **Secrets moved from the Infisical SDK to the CLI.** `loadSecrets()` ran on the first request and
  cached its promise, so an outage at that moment left a listening container serving 500s forever.
  `docker-entrypoint.sh` now exchanges machine-identity credentials for a short-lived token and execs
  through `infisical run`, failing the start instead. (#106)
- **The sitemap became a route** instead of a build-time snapshot, so it no longer goes stale on a
  catalog change and the build no longer reaches the database. (#106)
- **Hosting moved from Vercel to the VPS** — Coolify builds the Dockerfile and deploys on push to
  `prod`, behind Cloudflare, co-located with Postgres. (#106)
- **Restyle** — DM Sans with a display serif, the radius ladder at `1rem`, card texture, a single
  background band, and dark surfaces as a ladder rather than one colour. (#127, #145, `docs/DESIGN_DECISIONS.md`)
- **Leaving a quiz** routes through one confirmation wherever it happens, so an attempt is finished or
  cancelled rather than left open forever.

### Fixed

- Quiz results are scored from the stored verdict rather than re-graded against the question as it
  stands now, so editing a correct answer no longer rewrites past results.
- Completing a quiz whose section was deleted refuses and rolls back, instead of committing a score of 0.
- Daily study stats and mastery agree on what a scope means, which had exam simulations reading 0% accuracy.
- Chart bucket labels are built from their UTC day, and the tick gauge rounds its trig output — both
  were hydration mismatches for viewers outside the server's timezone.
- The attempt history filters on the insegnamento and on the viewer's calendar day, not on the course
  and the database's UTC date.
- Maintainers can no longer reach private sections. (`src/lib/admin/access.ts`)
- Grade colours map onto status tokens, fixing unreadable grades in dark mode. (#118)
- The 404 page is invoked on a nested miss, and the quiz and flashcard misses get the real one.
- A finished flashcard session is recorded once per session id, instead of once per replay of its URL.
- `legal_acceptances` records the Cloudflare client IP rather than the head of `X-Forwarded-For`.

### Removed

- The `progress` table — every figure it held is now derived from `quiz_attempts` and
  `answer_attempts`. (migration `0015`)
- Legacy RLS policies, helper functions and `*_detail` views. (#89)
- `answer_attempts.time_spent`, which was never written or read. (migration `0017`)
- The UniMore network graph. (#158)
- `@infisical/sdk` and `src/lib/secrets`. (#106)

### Security

- Transitional `anon`/`authenticated` grants revoked. (#89)
- PostgREST exposure closed by pointing it at an empty `api` schema. (#92)
- The `protect_profile_role` trigger dropped; role updates no longer error. (#115)

### Migrations

`0000`–`0017`, applied by hand to the production database on 2026-08-25. `0011` and `0014` are
backfills; `0015` and `0017` are destructive and were taken after a dump. Applying a migration is
never automated — see `CLAUDE.md`.
