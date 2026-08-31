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

## 3.2.0 — 2026-08-30

The restyle lands. One frame — `InsetCard` — replaces the surfaces five areas had hand-rolled, the
outcome screens are rebuilt around what a student actually needs after a run, and the analytics hub
gains detail pages and a window that lives in the URL.

### Added

- **`InsetCard`** — the muted frame around a card panel, previously hand-rolled in five places and now
  the surface for browse, the landing, the legal screens, about and contact, search states, the request
  detail, the admin detail panels, the settings and quiz question panels, the stat tiles and their
  skeletons, the data table and the score panels. (#127, #146, #148, #156)
- **The quiz results page, rebuilt.** The grade sits on the five bands with the distance to the next
  one; blank answers are counted apart from wrong ones, which under a penalty are not the same event;
  pace is read against the time limit in a simulation or the student's own average on the section;
  accuracy is split by difficulty; a penalised run shows where its points went. The question review
  moves onto `InsetCard` and opens filtered to what is left to go back to. (#157)
- **The attempt's run on its section** — every completed attempt on the same section in the same mode,
  so a result says whether it is going anywhere. The series stops at the attempt being viewed. (#157)
- **Flashcard results** on the same vocabulary: deck coverage instead of a grade, and the card list
  filtered to what was never turned over. (#157)
- **Starred attempts** — `quiz_attempts.is_favorite`, an optimistic star with an undo toast, and
  favourites as a filter on the history rather than a page of their own. (#147)
- **Analytics detail pages** for course, insegnamento and section on one shared view, with the window
  — period and mode — carried in the URL. (#147)
- **A segmented control**, for a filter whose two or three options are worth showing at once. (#157)
- **The quiz header names the run** — the section, or the class when it is an exam simulation. (#127)
- **Charts**: a scatter plot, donut variants and a frameless heatmap. (#127)

### Changed

- **`/user/progress` is now `/user/analytics`**, the old address redirecting. (#147)
- **One breadcrumb**, built on the `ui/breadcrumb` primitive: semantic markup, a dropdown for the
  collapsed middle, and labels cut at a character budget with the full name in a tooltip. (#127, #148)
- **The question is set apart from its answers.** Both were `prose-sm` and the options carried
  `border-2` against the question's single hairline, so the thing to read looked lighter than the
  things to pick. True/false options are sized as controls rather than as cards. (#157)
- **One table names the grades.** `GRADE_BANDS` carries the name and the mark; the parallel
  six-level `getGradeDescription` contradicted it and is gone. (#157)
- The analytics window and the home progress summary both open on the last year. (#147)
- Mastery exposes every ranked section rather than the two ends, and narrows by window and mode. (#147)
- Every chart goes through `ChartCard`. (#127)
- The browse path helpers moved to a client-safe module, so a breadcrumb can build the same routes a
  query does. (#157)

### Fixed

- **The session sliders cap at the limit the schemas enforce.** `startQuizFn` takes at most 100
  questions, but the number lived only inside the zod schema: a section with more than that — and an
  exam simulation, which draws from every section of a class, reaches it easily — let the slider ask
  for more, and the run died on a validation error the student could do nothing about.
- The breadcrumb tooltip appears only when the label is really clipped, measured rather than counted
  from a character budget in `ch`; its separator sits on the row's centre instead of the text baseline.
- A ratio with no data behind it renders as a gap, not as a zero. (#147)
- The inset panel is always positioned, so its texture cannot escape the panel.
- The toaster renders on our own tokens.

### Removed

- **Code nothing reaches**, found by sweeping every export in `src` for references across the repo:
  the client-side quiz scorer superseded when grading moved server-side, three helpers alive only in
  their own tests, a duplicate family of request submission schemas that nothing validated with, two
  unused query modules, and three admin hooks the course page bypasses by calling the endpoints itself.

### Migrations

- `0018_add_attempt_favorite.sql` — adds `quiz_attempts.is_favorite` and a partial index on the
  starred rows. Not destructive.

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
