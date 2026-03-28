# TriviaMore — Development Guide

> Reference for developers and LLMs working on the TriviaMore codebase.
> Covers architecture, patterns, conventions, and best practices.
> For UI/design conventions, see `DESIGN_SYSTEM.md`.

---

## Philosophy

**Correctness over cleverness.** Write code that is easy to read, easy to delete, and hard to misuse. Prefer explicit patterns over magic. When in doubt, follow the existing codebase — consistency trumps personal preference.

**Code comments must be in English.** UI text and error messages are in Italian.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | React 19 + TanStack Start | SSR, file-based routing, server functions |
| Data | TanStack React Query v5 | Server state management, caching |
| Database | Supabase (PostgreSQL) | Auth, DB, Storage, RLS |
| Validation | Zod | Schemas for forms and server inputs |
| Forms | React Hook Form | With `standardSchemaResolver` for Zod |
| Language | TypeScript (strict) | ES2022 target, bundler module resolution |
| Package Manager | pnpm | Always use pnpm, never npm or yarn |
| Secrets | Infisical | Wrapped in `infisical run --` for all scripts |

---

## SOLID Principles — How We Apply Them

### Single Responsibility
- Each file in `src/lib/<domain>/` has one job: `server.ts` (data access), `queries.ts` (cache config), `mutations.ts` (state changes), `schemas.ts` (validation), `types.ts` (type definitions).
- Components do one thing. A form component handles form logic. A list component handles rendering a list. Don't mix data fetching with presentation.

### Open/Closed
- The `useMutationWithToast` wrapper is open for extension (any mutation function, any invalidation keys) but closed for modification.
- Notification helpers (`createNotification`, `notifyAdminsInScope`) accept parameters — don't modify them for specific cases, pass different arguments.
- Enums in the DB can be extended with new values (`ALTER TYPE ... ADD VALUE`) without breaking existing code.

### Liskov Substitution
- All `SubmittedContent` variants (`SubmittedSection`, `SubmittedQuestions`, `SubmittedReport`, `SubmittedFileUpload`) are interchangeable via discriminated unions. Any function accepting `SubmittedContent` must handle all variants.
- All Supabase clients (`createServerSupabaseClient`, `supabaseAdmin`, `createClient`) share the same `SupabaseClient<Database>` type.

### Interface Segregation
- Query factories (`adminQueries`, `userQueries`, `requestQueries`) expose only the queries relevant to their domain. Components import only what they need.
- Server functions are granular — `getAdminRequestsFn` and `getUserRequestsFn` are separate, not a single function with a role parameter.

### Dependency Inversion
- Components depend on mutation hooks (`useCreateRequest`), not on server functions directly. The hook handles cache invalidation, toast messages, and error handling.
- Server functions depend on abstract auth guards (`requireAuth`, `requireAdmin`), not on raw Supabase auth checks.

---

## Project Structure

```
src/
├── components/          # UI components grouped by feature
│   ├── ui/             # Primitives (shadcn/ui)
│   ├── layout/         # Navbar, footer, LumaBar
│   ├── admin/          # Admin forms, tables, sidebar
│   ├── requests/       # Contribution forms, report dialog
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Business logic, one folder per domain
│   ├── <domain>/
│   │   ├── server.ts   # Server functions (data access)
│   │   ├── queries.ts  # React Query options
│   │   ├── mutations.ts # Mutation hooks
│   │   ├── schemas.ts  # Zod validation schemas
│   │   └── types.ts    # TypeScript types
│   └── supabase/       # Client instances + DB types
├── routes/             # TanStack Router file-based routes
├── styles/             # Global CSS
├── router.tsx          # Router configuration
└── entry-server.tsx    # SSR entry point
```

### Key rule: Domain separation

Each domain (`admin`, `user`, `auth`, `requests`, `notifications`, `quiz`, `browse`) is self-contained in `src/lib/<domain>/`. Never import from one domain's `server.ts` into another domain's component — go through queries/mutations.

**Exception:** Notification helpers are used by the requests server (cross-domain on the server is acceptable for side effects like notifications).

---

## Server Functions

### Pattern

```typescript
// GET — no input
export const getDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReturnType> => {
    await requireAdmin() // or requireAuth()
    const supabase = createServerSupabaseClient()
    // ... query logic
  },
)

// POST — with input
export const createDataFn = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; id: string }) => input)
  .handler(async ({ data }) => {
    // data is typed from inputValidator
  })

// POST — with Zod schema
export const createDataFn = createServerFn({ method: "POST" })
  .inputValidator(myZodSchema)
  .handler(async ({ data }) => { ... })
```

### Rules

1. **Always specify `method`** — `GET` for reads, `POST` for writes.
2. **Always guard access** — call `requireAuth()` or `requireAdmin()` at the top of every handler that needs authentication.
3. **Use `createServerSupabaseClient()`** for auth-aware queries (respects RLS). Use `supabaseAdmin` only when you need to bypass RLS (e.g., creating notifications, fetching cross-user profiles).
4. **Throw `new Error(message)`** for user-facing errors — the message appears in `toast.error()`. Use Italian for the message.
5. **Throw `redirect({ href: "..." })`** for auth redirects — only in guards.
6. **Generate IDs client-side** — `crypto.randomUUID()` for all new records.
7. **Never return `undefined`** — React Query requires non-undefined return values. Return `null` if no data.

### What NOT to do

```typescript
// BAD: No auth guard
export const unsafeFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createServerSupabaseClient()
  return supabase.from("profiles").select("*") // Anyone can call this!
})

// BAD: Using supabaseAdmin without requireAdmin
export const dangerousFn = createServerFn({ method: "POST" }).handler(async () => {
  await supabaseAdmin.from("profiles").delete().eq("id", "...") // No auth check!
})

// BAD: Generic error message
if (error) throw new Error("Error") // Use a descriptive Italian message
```

---

## React Query

### Query Keys

Hierarchical, predictable structure: `["domain", "entity", ...params]`

```typescript
export const adminQueries = {
  stats: () => queryOptions({ queryKey: ["admin", "stats"], ... }),
  department: (id: string) => queryOptions({ queryKey: ["admin", "department", id], ... }),
}
```

### Staleness Conventions

| Data type | staleTime | Why |
|-----------|-----------|-----|
| Auth session | 5 min | Rarely changes mid-session |
| Admin content tree | 2-5 min | Low-frequency updates |
| Browse/platform stats | 10 min | Almost static |
| Notification count | 30 sec | Should feel near-real-time |
| Most queries | default (5 min) | Router-level default in `router.tsx` |

### Route Loaders

Pre-fetch in route loaders for instant rendering:

```typescript
export const Route = createFileRoute("/_app/user/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  component: DashboardPage,
})
```

In the component, use `useSuspenseQuery` (data is guaranteed):

```typescript
const { data } = useSuspenseQuery(userQueries.profile())
```

Use `useQuery` only when data is optional or loaded on-demand.

---

## Mutations

### Wrapper Pattern

All mutations use a wrapper that handles toast + invalidation:

```typescript
function useMutationWithToast<TInput, TOutput>(
  mutationFn: (input: { data: TInput }) => Promise<TOutput>,
  options: {
    successMessage: string      // Italian
    invalidateKeys: string[][]  // Query keys to invalidate on success
    onSuccess?: () => void      // Extra callback (e.g., close dialog)
  },
)
```

### Rules

1. **Always invalidate related caches** — if you create a request, invalidate both user and admin query keys.
2. **Invalidate broadly when in doubt** — `["browse"]` invalidates all browse caches. Better to over-invalidate than show stale data.
3. **Pass `onSuccess` for UI side effects** — e.g., closing a dialog, resetting form state.
4. **Never call server functions directly from components** — always go through mutation hooks.

### Common invalidation patterns

```typescript
// Creating content → invalidate lists, stats, and browse
invalidateKeys: [["admin", "departments"], ["admin", "stats"], ["browse"]]

// User action → invalidate both user and admin views + notifications
invalidateKeys: [["requests", "mine"], ["admin", "requests"], ["admin", "requestCount"],
                  ["notifications"], ["notifications", "unreadCount"]]
```

---

## Database & Supabase

### Three Clients

| Client | Import | Auth | RLS | Use for |
|--------|--------|------|-----|---------|
| `createServerSupabaseClient()` | `@/lib/supabase/server` | User session (cookies) | Yes | Most server queries |
| `supabaseAdmin` | `@/lib/supabase/admin` | Service role | No (bypasses) | Notifications, cross-user data |
| `createClient()` | `@/lib/supabase/client` | Browser session | Yes | Client-side uploads (Storage) |

### Migration Conventions

- **File naming:** `00001_description.sql`, `00002_description.sql` (sequential)
- **Tables:** `snake_case` (`content_requests`, `quiz_attempts`)
- **Columns:** `snake_case` (`created_at`, `target_section_id`)
- **Enums:** `SCREAMING_SNAKE_CASE` values (`SUPERADMIN`, `MULTIPLE_CHOICE`)
- **IDs:** `TEXT PRIMARY KEY` for content, `UUID` for user references
- **Timestamps:** Always `TIMESTAMPTZ NOT NULL DEFAULT now()`, always add `updated_at` trigger
- **Indexes:** `idx_tablename_columnname`, use partial indexes (`WHERE column IS NOT NULL`)
- **Cascade:** `ON DELETE CASCADE` for parent relationships, `ON DELETE SET NULL` for optional refs

### RLS Rules

1. **Enable RLS on every table** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. **Use helper functions** — `is_superadmin()`, `is_department_admin(dept_id)`, etc.
3. **Helper functions use `SECURITY DEFINER`** — with `SET search_path = public` to prevent injection.
4. **Public read tables** — `FOR SELECT USING (true)` for departments, courses, etc.
5. **User-scoped tables** — `FOR SELECT USING (user_id = auth.uid())`
6. **Admin-scoped tables** — `FOR SELECT USING (is_superadmin() OR is_department_admin(...))`
7. **Insert check** — `FOR INSERT WITH CHECK (user_id = auth.uid())`

### Enum Management

In dev mode, add new enum values with:
```sql
ALTER TYPE public.my_enum ADD VALUE 'NEW_VALUE';
```

In the migration file, just update the `CREATE TYPE` statement (and `db reset` to apply).

---

## Zod Schemas

### Conventions

```typescript
// Italian error messages
z.string()
  .min(2, "Il nome deve essere di almeno 2 caratteri")
  .max(100, "Il nome non puo superare i 100 caratteri")
  .trim()

// Optional fields that allow empty string
z.string().max(500).optional().or(z.literal(""))

// Enums with custom message
z.enum(["EASY", "MEDIUM", "HARD"], {
  message: "La difficolta e obbligatoria",
})
```

### Rules

1. **Trim all string inputs** — `.trim()` on every text field.
2. **Italian error messages** — always, for every `.min()`, `.max()`, `.regex()`.
3. **Use discriminated unions** — `z.discriminatedUnion("type", [...])` for polymorphic data.
4. **Use `superRefine`** — for cross-field validation (e.g., MC questions must have options).
5. **Export input types** — `export type MyInput = z.infer<typeof mySchema>`.
6. **Separate create vs update schemas** — update schemas use `.partial().omit({ parent_id: true })`.

---

## TypeScript

### Type Derivation

Always derive types from the database when possible:

```typescript
import type { Tables } from "@/lib/supabase/database.types"

type Department = Tables<"departments">
```

Extend with relations for composite types:

```typescript
type AdminDepartment = Department & {
  courses: { count: number }[]
}
```

### Discriminated Unions

Use `type` field for polymorphic data:

```typescript
type SubmittedContent =
  | { type: "section"; name: string; description: string }
  | { type: "questions"; questions: SubmittedQuestion[] }
  | { type: "report"; reasons: string[]; comment: string | null }
  | { type: "file_upload"; file_name: string; file_path: string }
```

Always narrow with `if (submitted.type === "section")` before accessing type-specific fields.

### Rules

1. **Never use `any`** — use `unknown` and narrow, or proper generics.
2. **Prefer `type` over `interface`** — unless extending or declaration merging.
3. **Export types separately** — `import type { X }` for type-only imports.
4. **Use `as const`** for literal types — `"APPROVED" as const` in server responses.
5. **Cast JSONB carefully** — `req.submitted_content as unknown as SubmittedContent`.

---

## Error Handling

### Server Side

```typescript
// User-facing error (becomes toast.error)
throw new Error("Errore nel caricamento delle richieste")

// Auth redirect
throw redirect({ href: "/auth/login" })

// Supabase error forwarding
const { error } = await supabase.from("...").insert({...})
if (error) throw new Error("Errore nella creazione: " + error.message)
```

### Client Side

- **Mutations:** Handled automatically by `useMutationWithToast` — shows `toast.error(error.message)`.
- **Queries:** `useSuspenseQuery` propagates to route error boundaries. `useQuery` exposes `{ error, isError }`.
- **Never use `try/catch` in components** for query/mutation errors — the wrappers handle it.

### Rules

1. **Never swallow errors silently** — always log or display them.
2. **Be specific** — `"Proposta non trovata"` not `"Errore"`.
3. **Check `error` after every Supabase call** — even selects can fail (RLS, network).
4. **Don't expose internal details** — `error.message` from Supabase is OK in dev, sanitize in prod.

---

## Authentication & Authorization

### Role Hierarchy

```
SUPERADMIN > ADMIN > MAINTAINER > STUDENT
```

- **SUPERADMIN:** Full access to everything
- **ADMIN:** Manages assigned departments + downstream content
- **MAINTAINER:** Manages assigned courses + downstream content
- **STUDENT:** Read-only access to public content, can submit contributions

### Guards

```typescript
// In server functions
const user = await requireAuth()    // Returns AuthUser or redirects to login
const admin = await requireAdmin()  // Returns AuthUser or redirects to /user

// In route loaders
export const Route = createFileRoute("/_app/user/")({
  beforeLoad: () => requireAuth(),
})
```

### Rules

1. **Every server function that reads user data must call `requireAuth()`.**
2. **Every admin server function must call `requireAdmin()`.**
3. **Never trust client-side role checks alone** — always enforce on the server + RLS.
4. **Use RLS as the last line of defense** — even if the server function checks auth, RLS policies should also enforce access.

---

## Component Patterns

### Forms

```typescript
const form = useForm<MyInput>({
  resolver: standardSchemaResolver(mySchema),
  defaultValues: { ... },
})

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField control={form.control} name="fieldName" render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </form>
  </Form>
)
```

### Dialogs

```typescript
const [open, setOpen] = useState(false)
const mutation = useMutation(() => setOpen(false)) // Close on success

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription> {/* Required! */}
    </DialogHeader>
    {/* form */}
  </DialogContent>
</Dialog>
```

**Always include `DialogDescription`** — Radix UI warns if missing (`aria-describedby`).

### Searchable Selects (Combobox)

For lists with many items, use `Popover` + `Command`:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">...</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Cerca..." />
      <CommandList>
        <CommandEmpty>Nessun risultato</CommandEmpty>
        <CommandGroup>
          {items.map(item => <CommandItem key={item.value} ... />)}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

---

## Clean Code Rules

### Naming

- **Functions:** `camelCase`, verb-first (`getUserProfile`, `handleSubmit`, `toggleBookmark`)
- **Components:** `PascalCase` (`QuestionCard`, `RequestFormDialog`)
- **Types:** `PascalCase` (`ContentRequest`, `SubmittedContent`)
- **Constants:** `SCREAMING_SNAKE_CASE` for true constants (`MAX_FILE_SIZE`, `EMPTY_QUESTION`)
- **Files:** `kebab-case` (`request-form.tsx`, `notification-bell.tsx`)
- **Server functions:** `camelCase` + `Fn` suffix (`createRequestFn`, `getUserProfileFn`)
- **Hooks:** `use` prefix (`useAuth`, `useCreateRequest`, `useReducedMotion`)
- **Query factories:** `<domain>Queries` (`adminQueries`, `requestQueries`)

### Functions

1. **Small and focused** — one function, one job. If it's over 30 lines, consider splitting.
2. **No side effects in query functions** — queries are pure reads.
3. **Side effects in mutations only** — notifications, cache invalidation, toasts.
4. **Early returns** — check error conditions first, then proceed with happy path.
5. **Avoid nested ternaries** — use `if/else if` or extract to a function.

### Components

1. **One component per file** — except small helper components used only in that file.
2. **Props interface at the top** — or inline for simple props.
3. **No business logic in components** — delegate to hooks, server functions, utilities.
4. **`cn()` for conditional classes** — never string concatenation for Tailwind.
5. **`e.stopPropagation()`** — on buttons inside clickable containers (cards, rows).

### Avoid

- **Premature abstraction** — three similar lines are better than a helper used once.
- **God components** — if a component handles form state, data fetching, AND rendering, split it.
- **Magic strings** — use constants or enums for repeated string values.
- **Commented-out code** — delete it, git has history.
- **Console.log in production** — use `console.error` only for actual errors in server functions.
- **`any` type** — always type properly or use `unknown` with narrowing.

---

## Performance

1. **Route-level code splitting** — TanStack Router handles this automatically via file-based routes.
2. **`lazy()` for heavy components** — dialogs, charts, markdown renderers.
3. **`useMemo` / `useCallback`** — only when profiling shows a need, not by default.
4. **Pagination** — client-side with `usePaginatedSearch` for admin tables, server-side for large datasets.
5. **Partial indexes** — `CREATE INDEX ... WHERE column IS NOT NULL` for sparse columns.
6. **`refetchInterval`** — only for truly time-sensitive data (notification count: 60s).
7. **`staleTime`** — set appropriately per query type (see table above).

---

## Security

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client — it has no `VITE_` prefix for a reason.
2. **Always validate server function inputs** — use `.inputValidator()` on every POST function.
3. **RLS is mandatory** — every table must have RLS enabled with appropriate policies.
4. **Sanitize user content** — use `MarkdownRenderer` for displaying user-generated text (XSS prevention).
5. **File upload validation** — check file type AND size on both client and server (Supabase Storage `file_size_limit`).
6. **Signed URLs for private files** — `createSignedUrl(path, 3600)` with 1-hour expiry.
7. **CSRF protection** — TanStack Start handles this for server functions automatically.
8. **No secrets in client code** — use `process.env` (no `VITE_` prefix) for server-only secrets.

---

## Testing Checklist

Before considering a feature complete:

- [ ] Works in both light and dark themes
- [ ] Italian text for all user-facing strings
- [ ] English for code comments
- [ ] Auth guard on every server function
- [ ] RLS policy covers the new table/operation
- [ ] Query cache invalidated after mutations
- [ ] Notifications sent to relevant users
- [ ] Error messages are specific and Italian
- [ ] `DialogDescription` present on all dialogs
- [ ] `useReducedMotion` respected for animations
- [ ] Mobile responsive (check on small screens)
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
