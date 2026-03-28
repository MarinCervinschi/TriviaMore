# TriviaMore — Security Guide

> Security reference for developers and LLMs working on TriviaMore.
> Covers authentication, authorization, data protection, input validation, and hardening.
> For general development patterns, see `DEVELOPMENT_GUIDE.md`.

---

## Architecture Overview

```
Client (Browser)
  │
  ├── Supabase Anon Key (public, RLS-enforced)
  ├── TanStack Start Server Functions (SSR)
  │     ├── createServerSupabaseClient() → user session, RLS active
  │     └── supabaseAdmin → service role, bypasses RLS
  │
  └── Supabase Storage (direct upload, RLS on bucket)

Database (PostgreSQL)
  ├── Row Level Security on ALL tables
  ├── SECURITY DEFINER helper functions
  └── Role escalation trigger protection
```

**Defense in depth:** Every data access point is protected by at least two layers — server-side auth guards AND database RLS policies.

---

## Authentication

### Session Management

- Sessions are managed by **Supabase Auth** via SSR cookies.
- Server functions use `createServerSupabaseClient()` which reads the session from cookies automatically.
- No manual JWT handling — Supabase SSR library manages token refresh, cookie rotation, and expiry.

### Password Policy

```
Minimum: 6 characters (consider increasing to 8+)
Required: lowercase + uppercase + digit
Forbidden: spaces
```

Enforced in `src/lib/auth/schemas.ts` via Zod `superRefine`.

### OAuth Flow

- Providers: GitHub, Google
- Flow: `oauthSignInFn` → Supabase redirect → `/auth/callback` → `exchangeCodeFn`
- **Redirect URL validation:** configured in the Supabase dashboard (allowed redirect URLs list), not just the env var.

### Auth Guards

Three guards, each a `createServerFn`:

| Guard | Returns | Redirects to | Use for |
|-------|---------|-------------|---------|
| `requireAuth()` | `AuthUser` | `/auth/login` | Any authenticated route |
| `requireAdmin()` | `AuthUser` | `/user` | Admin-only server functions |
| `requireGuest()` | void | `/user` | Login/register pages |

### Rules

1. **Every server function that accesses user data must call `requireAuth()` or `requireAdmin()`.**
2. **Never trust client-side role checks alone** — the server function + RLS are the real enforcement.
3. **Auth guards throw `redirect()`** — don't catch these errors, let TanStack Router handle them.
4. **Don't store auth tokens manually** — Supabase SSR handles cookies automatically.

---

## Authorization (Role Hierarchy)

```
SUPERADMIN
  └── ADMIN (scoped to departments)
       └── MAINTAINER (scoped to courses)
            └── STUDENT (read-only public content)
```

### Role Enforcement Layers

| Layer | Mechanism | Bypassed by |
|-------|-----------|-------------|
| **Client UI** | Conditional rendering | Anyone with DevTools |
| **Server function** | `requireAdmin()` guard | Nothing (throws redirect) |
| **Database RLS** | Policy checks `auth.uid()` + role | `supabaseAdmin` only |
| **Trigger** | `protect_profile_role()` | Service role only |

### Role Escalation Protection

A PostgreSQL trigger prevents any non-SUPERADMIN from changing the `role` column:

```sql
CREATE FUNCTION public.protect_profile_role()
-- IF current_setting('role') != 'service_role' AND NOT is_superadmin()
-- THEN RAISE EXCEPTION
```

Additionally, `updateUserRoleFn` in `admin/server.ts` checks `user.role === "SUPERADMIN"` before proceeding.

**Never modify role checks** without understanding both the trigger AND the server function guard.

---

## Row Level Security (RLS)

### Status: Enabled on ALL tables

Every table in the database has RLS enabled. No exceptions.

### Helper Functions

All defined with `SECURITY DEFINER` and `SET search_path = public`:

| Function | Logic |
|----------|-------|
| `is_superadmin()` | `role = 'SUPERADMIN'` |
| `is_department_admin(dept_id)` | Superadmin OR in `department_admins` |
| `is_course_maintainer(crs_id)` | Dept admin of parent OR in `course_maintainers` |
| `is_class_admin(cls_id)` | Course maintainer of parent course |
| `is_section_admin(sec_id)` | Class admin of parent class |
| `can_access_section(sec_id)` | Public OR (auth'd AND (admin OR explicit grant)) |

### Policy Patterns

```sql
-- Public read (departments, courses, classes, evaluation_modes)
CREATE POLICY FOR SELECT USING (true);

-- User-scoped (bookmarks, progress, notifications)
CREATE POLICY FOR SELECT USING (user_id = auth.uid());

-- Admin-scoped (content_requests)
CREATE POLICY FOR SELECT USING (
  user_id = auth.uid()
  OR is_superadmin()
  OR is_department_admin(target_department_id)
  OR ...
);

-- Insert: user can only create own records
CREATE POLICY FOR INSERT WITH CHECK (user_id = auth.uid());
```

### Rules for New Tables

1. **Always enable RLS** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. **Always add at least SELECT + INSERT policies** — even if the table seems internal.
3. **Use helper functions** — don't repeat role-checking logic in policies.
4. **Test policies** — verify that students can't see admin data, and admins can't see other departments.
5. **Notifications are special** — INSERT is unrestricted (server-side via `supabaseAdmin`), SELECT is user-scoped.

---

## Supabase Clients — When to Use Which

### `createServerSupabaseClient()` (DEFAULT)

- **Import:** `@/lib/supabase/server`
- **Auth:** User session from cookies
- **RLS:** Active — queries are filtered by the user's role
- **Use for:** All standard queries in server functions

### `supabaseAdmin` (PRIVILEGED)

- **Import:** `@/lib/supabase/admin`
- **Auth:** Service role key
- **RLS:** Bypassed — full access to all data
- **Use ONLY for:**
  - Creating notifications (user can't insert for others)
  - Fetching cross-user profiles (profiles RLS is restrictive)
  - Creating content on approval (`approveRequestFn`)
  - Admin user management (`updateUserRoleFn`)

### `createClient()` (BROWSER)

- **Import:** `@/lib/supabase/client`
- **Auth:** Browser session (anon key)
- **RLS:** Active
- **Use ONLY for:** Client-side file uploads to Supabase Storage

### Rules

1. **Default to `createServerSupabaseClient()`** — it's auth-aware and RLS-enforced.
2. **Every use of `supabaseAdmin` requires `requireAdmin()` BEFORE it** — no exceptions.
3. **Never import `supabaseAdmin` in client components** — it would expose the service role key.
4. **Never pass `supabaseAdmin` to client code** — not as a prop, not via context, never.

---

## Input Validation

### Server Functions

Every POST server function must validate its input:

```typescript
// Preferred: Zod schema
createServerFn({ method: "POST" })
  .inputValidator(myZodSchema)
  .handler(async ({ data }) => { ... })

// Acceptable: Manual type validator
createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; name: string }) => input)
  .handler(async ({ data }) => { ... })
```

### Validation Rules

1. **All strings must be trimmed** — `.trim()` in Zod schemas.
2. **All strings must have max length** — prevent payload abuse.
3. **Enums must use `z.enum()`** — never accept arbitrary strings for status/type fields.
4. **IDs must be non-empty strings** — `z.string().min(1)`.
5. **File sizes validated on both client AND server** — Supabase Storage `file_size_limit` in bucket config.
6. **Never trust `submitted_content` JSONB blindly** — always cast through typed interfaces and validate structure.

### What to Validate

| Data | Validation |
|------|------------|
| User names | Unicode regex, 2-50 chars, no consecutive spaces |
| Emails | Zod `.email()`, lowercased, max 100 chars |
| Passwords | 6+ chars, uppercase + lowercase + digit, no spaces |
| Content text | Min 10, max 2000 chars, trimmed |
| Codes | Uppercase + numbers + hyphens, 2-15 chars |
| File uploads | Extension whitelist (.pdf, .docx), max 10 MB |
| Question options | 2-6 items, non-empty strings |

---

## XSS Prevention

### Markdown Rendering

User-generated content (questions, explanations) is rendered via `react-markdown`:

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {content}
</ReactMarkdown>
```

`react-markdown` is safe by default — it does NOT render raw HTML. It converts markdown to React elements.

### Rules

1. **Never use `dangerouslySetInnerHTML`** — use `react-markdown` or plain text.
2. **Never interpolate user content into HTML attributes** — use React's JSX which auto-escapes.
3. **Sanitize URLs** — if displaying user-provided URLs, validate the protocol (`http://` or `https://` only).
4. **Consider adding `rehype-sanitize`** — for extra protection on markdown output:
   ```tsx
   import rehypeSanitize from 'rehype-sanitize'
   rehypePlugins={[rehypeKatex, rehypeSanitize]}
   ```

---

## Environment Variables

### Server-Only (NEVER expose to client)

```
SUPABASE_SERVICE_ROLE_KEY    # Full DB access, bypasses RLS
INFISICAL_CLIENT_ID          # Secrets management
INFISICAL_CLIENT_SECRET      # Secrets management
GITHUB_CLIENT_SECRET         # OAuth (managed by Supabase Auth)
GOOGLE_CLIENT_SECRET         # OAuth (managed by Supabase Auth)
```

These have NO `VITE_` prefix — Vite strips them from client bundles.

### Client-Exposed (by design)

```
VITE_SUPABASE_URL            # Public Supabase endpoint
VITE_SUPABASE_ANON_KEY       # Public key, RLS-enforced
VITE_SITE_URL                # Site URL for SEO/metadata
VITE_APP_URL                 # App URL for OAuth redirects
```

### Rules

1. **Never add `VITE_` prefix to secrets** — they become visible in the client bundle.
2. **Use Infisical** for all secrets in production — `infisical run --` wraps all commands.
3. **Never commit `.env` files** — ensure `.gitignore` includes all `.env*` patterns.
4. **Rotate secrets immediately** if accidentally exposed.
5. **OAuth secrets are managed by Supabase** — configured in the Supabase dashboard, not in app code.

---

## File Upload Security

### Client-Side Validation

```typescript
const ACCEPTED_EXTENSIONS = ".pdf,.docx"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Validate before upload
if (file.size > MAX_FILE_SIZE) {
  toast.error("Il file supera il limite di 10 MB")
  return
}
```

### Server-Side Validation

Supabase Storage bucket enforces:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contributions', 'contributions', false, 10485760); -- 10 MB
```

### Storage RLS

```sql
-- Users upload to their own folder only
(storage.foldername(name))[1] = auth.uid()::text

-- Users read their own files only
-- Admins (non-STUDENT) read all files
```

### Signed URLs

Admin file downloads use signed URLs with 1-hour expiry:
```typescript
supabaseAdmin.storage.from("contributions").createSignedUrl(path, 3600)
```

### Rules

1. **Always validate file type on the client** — `accept` attribute on `<input type="file">`.
2. **Always enforce size limits on both client AND server** — bucket `file_size_limit`.
3. **Use signed URLs** — never expose raw storage paths to the client.
4. **Path isolation** — user files stored under `{user_id}/` prefix, enforced by RLS.
5. **Download via blob** — fetch signed URL → create blob → trigger download (avoids popup blockers and CORS issues).

---

## Security Headers

### Recommended Headers (implement in Nitro/Vite config)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Status: Not yet implemented

This is a priority hardening task. Can be added via Nitro server middleware or Vercel `vercel.json` headers.

---

## Rate Limiting

### Status: Not yet implemented

### Priority Endpoints

| Endpoint | Risk | Recommended Limit |
|----------|------|-------------------|
| Login | Brute force | 5 attempts / 15 min per email |
| Signup | Bot registration | 3 registrations / hour per IP |
| File upload | Storage abuse | 10 uploads / hour per user |
| Content submission | Spam | 20 submissions / hour per user |

### Implementation Options

1. **Supabase Edge Functions** — rate limit at the edge before hitting the DB
2. **Nitro middleware** — in-memory counter per IP/user (stateless, resets on deploy)
3. **Database-backed** — `rate_limits` table with cleanup cron

---

## Common Vulnerabilities & Mitigations

### SQL Injection
- **Mitigated:** Supabase client uses parameterized queries. Never construct raw SQL in server functions.
- **Rule:** Always use `.eq()`, `.in()`, `.select()` — never string interpolation.

### CSRF
- **Mitigated:** TanStack Start server functions include CSRF protection by default.
- **Rule:** Always use `createServerFn` for mutations, never raw fetch to your own API.

### Privilege Escalation
- **Mitigated:** Triple-layer protection (server guard + RLS + trigger).
- **Rule:** Never modify the `protect_profile_role` trigger without security review.

### Insecure Direct Object References (IDOR)
- **Mitigated:** RLS policies filter by `auth.uid()` — users can only access their own data.
- **Rule:** Always rely on RLS, not just server-side checks. A forgotten filter in a server function is caught by RLS.

### Mass Assignment
- **Mitigated:** `.inputValidator()` on every server function restricts which fields are accepted.
- **Rule:** Never spread raw user input into a database insert/update. Always pick specific fields.

### Sensitive Data Exposure
- **Mitigated:** Profiles RLS restricts cross-user visibility. Service role key is server-only.
- **Rule:** When showing other users' data (comments, requests), use branded labels ("TriviaMore Team") instead of real admin profiles.

---

## Security Checklist for New Features

Before merging any feature:

- [ ] All server functions have auth guards (`requireAuth` or `requireAdmin`)
- [ ] All POST functions have `.inputValidator()`
- [ ] All new tables have RLS enabled with appropriate policies
- [ ] `supabaseAdmin` usage is justified and guarded by `requireAdmin()`
- [ ] No `VITE_` prefix on new secrets
- [ ] File uploads validated (type + size) on client AND server
- [ ] User-generated content rendered safely (no `dangerouslySetInnerHTML`)
- [ ] Error messages don't expose internal details (stack traces, DB schema)
- [ ] No `any` types that bypass TypeScript safety
- [ ] Tested: student can't access admin data, admin can't access other departments
