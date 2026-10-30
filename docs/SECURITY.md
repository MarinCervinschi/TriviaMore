# Security

How TriviaMore decides who may read and change what, where each check lives, and what a new feature has to
do to keep it that way. The layering, the roles and the logging rules are in `CLAUDE.md`; this document does
not repeat them. How to build a feature is in `DEVELOPMENT_GUIDE.md`.

## The trust boundary

The browser talks to the app through server functions (`createServerFn`) and four HTTP routes:
`/api/auth/$` (Better Auth), `/api/requests/$requestId/attachment`, `/api/log` and `/api/health`. It never reaches the
database or the S3 store. Everything behind that boundary runs with full rights:

- **Postgres:** every query runs through Drizzle on a direct `pg` connection (`src/db/index.ts`) as
  `trivia_app`, a role with `BYPASSRLS`.
- **S3 (Garage):** one key pair with access to both buckets, used only by `src/lib/storage/server.ts`.

So the only checks that exist are the ones written in TypeScript. A server function without a guard is open to
anyone who can send an HTTP request, and a query without a `where` on the user returns every user's rows.

## Authentication

Better Auth runs inside the app, configured in `src/lib/auth/server.ts`, on the `users`, `sessions`,
`accounts` and `verifications` tables.

- **Sessions** are rows in `sessions`, referenced by an `httpOnly`, `SameSite=Lax` cookie that Better Auth
  sets and rotates. `readSession()` reads a signed cookie cache first, valid for 5 minutes, so a revoked session
  keeps working for up to 5 minutes on a device that already has the cache.
- **Passwords** are bcrypt hashes (cost 10) in `accounts.password`, checked by `src/lib/auth/rules.ts`. The
  policy is in `src/lib/auth/schemas.ts`: 6 to 100 characters, a lowercase letter, an uppercase letter and a
  digit, no spaces. A password reset revokes every other session.
- **Email verification** is required before a password sign-in works. The verification and reset links expire
  after an hour. They are sent without awaiting the mail server, so the response time does not reveal whether
  an address has an account.
- **OAuth:** Google and GitHub, each enabled only when both its client id and secret are set. `oauthSignInFn`
  asks Better Auth for the provider URL; the provider returns to `<BETTER_AUTH_URL>/api/auth/callback/<provider>`,
  the only callback registered in its console. A new account lands on `/onboarding`.
- **Profiles:** a Better Auth hook creates the `profiles` row when a user is created. The role lives on the
  profile, not on the Better Auth user.
- **Staging:** `AUTH_ALLOWED_EMAIL_DOMAIN` turns off password sign-up and rejects any user who is not a
  verified address of that domain. Production leaves it unset.
- **Anonymized accounts:** `getAuthUser()` returns `null` for a profile with `anonymizedAt` set, and the
  anonymization deletes the user's sessions and accounts.

## Authorization

### Guards and middleware

Guards are plain functions in `src/lib/auth/guards.ts`. They redirect rather than throw an `AppError`, because
they are also what route `beforeLoad` calls (through the server-function wrappers in `src/lib/auth/api/`).

| Guard | Lets through | Otherwise |
|---|---|---|
| `requireAuth()` | any signed-in user with a live profile | redirect to `/auth/login` |
| `requireAdmin()` | MAINTAINER, ADMIN, SUPERADMIN | redirect to `/user` |
| `requireSuperadmin()` | SUPERADMIN | redirect to `/user` |
| `requireGuest()` | no session | redirect to `/user` |

The middleware in `src/lib/server/middleware/auth.ts` is what an endpoint declares:

- `authMiddleware` reads the session and puts `{ id, email }` in `context.user`, or throws `Unauthorized`. It
  does not load the profile, so it does not know the role.
- `optionalAuthMiddleware` does the same with `context.user` possibly `null`, for public reads that change
  with the user (section access, bookmarks).
- `adminMiddleware` and `superadminMiddleware` wrap the guards and put the full `AuthUser` in the context.

The admin endpoints in `src/lib/admin/api/` call the guard inside the service instead (`requireSuperadmin()`
at the top of `updateUserRole`, `requireContentManagerForQuestion(id)` at the top of `updateQuestion`).
Either is fine; what is not fine is neither.

### Content scope

`src/lib/admin/access.ts` holds the checks that depend on what is being touched:

- **MAINTAINER** may manage sections and questions only of classes taught in a course it maintains
  (`course_maintainers`), and never a private section. `requireContentManagerForClass`, `…ForSection` and
  `…ForQuestion` throw `Forbidden` for anything outside that; the `require…Access` variants redirect to `/admin`
  and are for route loaders. `requireStructureManager()` keeps MAINTAINER away from departments, courses and
  classes.
- **ADMIN** passes every content check. Its `department_admins` rows decide which notifications it receives and
  what its dashboard shows; they do not restrict what it may change.
- **SUPERADMIN** is the only role for platform features (changelogs, news, user roles, department admins).
- **Requests:** `requireRequestAdmin()` in `src/lib/requests/service/shared.ts` returns a MAINTAINER's course
  ids; `requestScope()` narrows the list queries and `assertInScope()` checks a single request. A request aimed
  at a private section stays with ADMIN and SUPERADMIN.

A role changes only through `updateUserRoleFn`, which requires SUPERADMIN and removes the department and
course assignments the new role no longer has. No other endpoint accepts a `role` field.

### Section access

Private sections are gated by `src/lib/auth/checks.ts`. A section is readable when it is public, when the
user is ADMIN or SUPERADMIN, or when `section_access` grants it to the user. MAINTAINER gets no implicit access
to private sections.

- `assertSectionAccess(db, userId, sectionId)` throws `Forbidden`; quiz and flashcard sessions call it before
  they read any question.
- `filterAccessibleSections()` and `accessibleSectionsSql()` narrow lists and search.

Any new path from a section id or a question id to question content has to go through one of these.

## Data access

Every table has RLS enabled and no policy. That denies every role that does not bypass RLS, and filters
nothing for `trivia_app`. The consequences:

- **A read narrowed to the user says so:** `.where(eq(bookmarks.userId, userId))`. The `userId` comes from
  `context.user.id`, never from the input.
- **A write to a user's row names the user in the `where`,** so an id from another user matches nothing:
  `and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId))`.
- **Code written before the move off RLS** may have relied on a policy that no longer exists. Its condition
  has to be in the `where` clause.

Drizzle parameterizes every value. A `sql` template interpolates values as parameters too; never build SQL
with string concatenation or `sql.raw` on input.

## Input validation

Every server function that takes input has `.inputValidator()` with a zod schema from the domain's
`schemas.ts`. Strings are trimmed and have a maximum length, ids are `z.uuid()` / `z.string().uuid()`,
enumerations are `z.enum`. Pick the fields a write sets one by one; never spread the input into
`.set()` or `.values()`.

`submitted_content` on a content request is jsonb from the user. It goes through `parseSubmittedContent()`
before use, and `assertOwnAttachment()` rejects a `file_path` that is not under the user's own prefix or
contains `..`.

## Errors

`errorMiddleware` (registered in `src/start.ts`) lets an `AppError` from `src/lib/server/errors.ts` through
with its message, and replaces anything else with a generic Italian message plus the first 8 characters of
the trace id, after logging it. A Postgres error, a stack trace or an S3 response body therefore never reaches
the browser. A message meant for the user is an `AppError`; `rethrowUniqueViolation()` turns a unique-key
violation into a `Conflict`.

The attachment route maps `AppError` codes to HTTP statuses itself, since it is not a server function.

## Files

There are two buckets, both reached only from the server:

| Bucket | Served | Holds |
|---|---|---|
| `public` | as is, on `S3_PUBLIC_URL` | generated avatars (`avatars/<userId>/…`), uploaded photos (`avatar-uploads/<userId>/…`) |
| `contributions` | only through the app | request attachments (`<userId>/<uuid>.<ext>`) |

Bytes reach the server as `FormData` in a server function. `formFileSchema()` in `src/lib/storage/schemas.ts`
rejects a missing file and enforces the size limit before the handler runs. The service then checks the bytes
and chooses the key; the client never names a path.

- **Avatar photos** (`uploadAvatar` in `src/lib/avatar/service.ts`): at most 2 MB; the type is read from the
  magic bytes (JPEG, PNG, WebP), never from the browser, so the public bucket serves raster images only. The
  browser downscales to 512 px first; its own type and 20 MB checks are a convenience.
- **Generated avatars** are SVGs rendered on the server from a seed. An SVG from the browser is never stored.
- **Attachments** (`uploadAttachment` in `src/lib/requests/service/user-requests.ts`): at most 10 MB, extension
  `pdf` or `docx`, and the first four bytes must match that format.
- **Reading an attachment:** `/api/requests/$requestId/attachment` calls `readAttachment()`, which applies the
  same `requireRequestAdmin()` and `assertInScope()` as the request itself, then streams the object with
  `content-disposition: attachment` and `cache-control: private, no-store`. There are no signed URLs.

## Secrets

Secrets come from Infisical; the variables and how they are injected are in `docs/SECRETS.md`, the local
fallback in `.env.example`. Anything prefixed `VITE_` is inlined into the client bundle, so a secret never
gets that prefix. Server-only values are read from `process.env` in server-only modules (`src/lib/auth/server.ts`,
`src/lib/storage/server.ts`, `src/db/`), which `createServerFn` keeps out of the browser bundle. `.env` and
`.env.*` are gitignored, and the pre-push hook (`scripts/check-public.sh`) blocks secrets in pushed lines.

## Rendering user content

Questions, explanations and request text are rendered with `MarkdownRenderer`
(`src/components/ui/markdown-renderer.tsx`), built on `react-markdown`, which does not render raw HTML.
`dangerouslySetInnerHTML` appears only for the theme init script in `src/routes/__root.tsx` and the chart
styles in `src/components/ui/chart.tsx`, neither of which takes user input. Keep it that way.

## Logs

Logs go to Seq (`docs/OBSERVABILITY.md`). The context carries the user id, never the email. Property keys that
contain `password`, `token`, `secret`, `apikey` and the like are replaced with `[redacted]`, and query spans
carry the statement text without its parameters. Never pass a whole object to `log`.

## Not in place

- **Security headers:** the app sets none. There is no CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy` or HSTS from `src/start.ts`, the middleware or `vite.config.ts`. Whatever Cloudflare or
  Coolify add is outside this repository.
- **CSRF tokens:** there are none. Cross-site writes are stopped by the session cookie being `SameSite=Lax`,
  which a cross-site POST does not carry, and by Better Auth's origin check on `/api/auth/*`. A GET server
  function is reachable by top-level navigation with the cookie, so a GET server function never writes.
- **Rate limiting:** Better Auth's built-in limiter is on in production, in memory per process, keyed on
  `cf-connecting-ip`: 100 requests per 10 seconds, 3 per 10 seconds on sign-in and sign-up, 3 per minute on
  reset and verification emails. It applies only to requests through `/api/auth/*`; `loginFn`, `signupFn` and
  the other auth server functions call `getAuth().api` directly and are not limited. `/api/log` has its own
  limit of 60 batches a minute per IP. Nothing else is limited, uploads and request submissions included.

## Checklist for a new feature

- [ ] Every new server function declares `authMiddleware`, `optionalAuthMiddleware` or an admin middleware, or
      its service calls a guard first. A public one is public on purpose.
- [ ] The user id comes from `context.user` or the guard's return value, never from the input.
- [ ] Every read of per-user data has the user in its `where`; every write to a user's row too.
- [ ] Content managed by MAINTAINER goes through `src/lib/admin/access.ts`; platform features require
      SUPERADMIN.
- [ ] Any path to question content goes through `src/lib/auth/checks.ts`.
- [ ] Every input has a zod schema with maximum lengths; writes pick fields one by one.
- [ ] Messages for the user are `AppError`s; nothing else carries detail to the browser.
- [ ] Uploads go through a server function with `formFileSchema`, a check on the bytes and a key chosen by the
      server; private files are read through a route that repeats the owning record's check.
- [ ] A new table has `.enableRLS()` and no policy.
- [ ] No new secret has a `VITE_` prefix; new variables are added to Infisical, `docs/SECRETS.md` and
      `.env.example`.
- [ ] User text is rendered through `MarkdownRenderer` or as plain text.
- [ ] Logs carry ids, not objects or emails.
- [ ] GET server functions do not write.
