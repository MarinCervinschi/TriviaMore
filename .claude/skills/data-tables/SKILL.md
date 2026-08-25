---
name: data-tables
description: How tables are built in TriviaMore — the shared DataTable on TanStack Table v9, column defs and their meta, faceted filters, sorting, pagination, URL state via search params, and server-driven tables. Use whenever adding a table, adding or reordering a column, wiring a filter, changing what a table sorts or paginates by, or reviewing anything under src/components/data-table/.
---

# Data tables

There is **one** table component and every table in the app goes through it:
`src/components/data-table/`. `components/ui/table` is the styling primitive underneath it — render
it directly only for a layout that is a grid but not a dataset (there are currently none).

The rule that shapes everything: **the column def is the single source of truth.** Header text,
sortability, alignment, responsive hiding, the cell renderer and whether the column becomes a filter
all live in one object. A route never writes `<TableHead>` or `<td>`.

## The pieces

| | |
|---|---|
| `features.ts` | the shared `tableFeatures({…})` set, `column.meta`/`table.meta` types, `createDataTableColumns` |
| `use-data-table.ts` | the hook: wires state to the URL **or** to component state, same signature |
| `data-table.tsx` | container, header row, cells, row link, empty state, pagination |
| `data-table-toolbar.tsx` | debounced search, faceted filters, reset, column visibility |
| `data-table-faceted-filter.tsx` | the multi-select popover with counts |
| `data-table-column-header.tsx` | the sortable header button |
| `data-table-pagination.tsx` | wraps `ui/pagination`, which card grids also use — do not fold it in |
| `data-table-empty.tsx` | the in-card empty line, for tables inside their own `Card` |

## The shape of a table

```tsx
const column = createDataTableColumns<AdminUser>();

function buildColumns(onDelete: (id: string) => void) {
  return [
    column.accessor("name", {
      header: "Utente",
      meta: { label: "Utente" },
      cell: ({ row }) => <Link to="/admin/users/$userId" params={{ userId: row.original.id }}>{row.original.name}</Link>,
    }),
    column.accessor("role", {
      header: "Ruolo",
      filterFn: "facet",
      meta: { label: "Ruolo", facet: { options: ROLE_OPTIONS, icon: UserIcon } },
      cell: ({ row }) => <Badge>{ROLE_LABELS[row.original.role]}</Badge>,
    }),
    column.display({
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      meta: { label: "Azioni", align: "right" },
      cell: ({ row }) => <AdminRowActions onDelete={() => onDelete(row.original.id)}>…</AdminRowActions>,
    }),
  ];
}

const columns = useMemo(() => buildColumns(setDeleteId), []);

const table = useDataTable({
  data: users,
  columns,
  getRowId: row => row.id,
  searchFn: (u, q) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  urlState: { values: search, onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }) },
});

<DataTable table={table} toolbar={<DataTableToolbar table={table} />} empty={<DataTableEmpty>…</DataTableEmpty>} />
```

### `column.meta`

| field | effect |
|---|---|
| `label` | name in the column-visibility menu and as the filter's title |
| `align` | `left` (default) / `center` / `right` — applies to header **and** cells |
| `hideBelow` | `sm`/`md`/`lg`/`xl`; hides header and cells together, so they can never drift apart |
| `headerClassName` / `cellClassName` | escape hatches, e.g. `w-[40%]`, `min-w-[16rem]` |
| `facet.options` | turns the column into a multi-select filter in the toolbar |
| `facet.icon` | the glyph the inline chip leads with — give every facet one |

`hideBelow` maps to four literal class strings in `data-table.tsx`. Adding a breakpoint means adding
a literal there — Tailwind's scanner cannot see an interpolated class name.

### Filters: two variants

`DataTableToolbar` takes `filterVariant`. `buttons` (the default) shows one dashed button per facet,
always visible. **`inline` is what the app uses**: a single filter icon on the right, and a removable
chip on the left per active facet, each carrying an operator — *è uno di* / *non è uno di*. Both drive
the same column filter state, so a column def does not change between them.

A filter the table cannot own — a date range, say — is a `CustomInlineFilter` passed through
`inlineFilters`: it renders its own panel and writes its own search params, and it reports `active` so
the reset button appears. Because those params are not column ids, list them in `extraResetKeys` on
`useDataTable` or Reset will leave them behind (`/user/progress/history` does this with `da`/`a`).

### `DataTable` props

`toolbar`, `empty`, `rowLink`, `density` (`comfortable` default / `compact`), `bordered` (default
true — pass `false` inside a `Card`), `showPagination`.

`rowLink` takes a **bare** `<Link>`: `row => <Link to="…" params={…} aria-label={`Apri ${row.name}`} />`.
The arrow cell, its column and the hover animation are added for you. Do not render your own trailing
arrow column — that implicit column is exactly what made the old `BrowseTable` unsafe. Return **null**
for a row that has nowhere to go — a deleted target, say — and its arrow cell stays empty while the
column keeps its shape.

## State: URL or local

`urlState` is opt-in and both modes have the same signature, so switching is one prop.

```ts
// route
validateSearch: z.object({ ...dataTableSearchFields, role: dataTableFilterField }),

// component
const navigate = useNavigate({ from: Route.fullPath });
const search = Route.useSearch();
urlState: { values: search, onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }) }
```

`dataTableSearchFields` gives `q`, `page`, `sort`, `dir`. **Add one `dataTableFilterField` per faceted
column, named exactly after the column id** — the hook reads `search[columnId]` as a comma-separated
list. Column visibility and row selection stay local on purpose: they are noise in a URL.

Rules the hook already enforces, so don't re-implement them:

- A default value is written as `undefined`, which **removes** the param. `/admin/users` stays clean.
- Any filter or sort change resets `page`.
- `enableSortingRemoval: false` — a header cycles asc → desc → asc. There is no third "unsorted"
  state because the URL has no way to distinguish it from "never sorted".
- Reset goes through `table.options.meta.resetFilters()`, never the per-slice reset APIs: with URL
  state those fire two `navigate` calls in one tick and the second reads stale params, dropping the
  first.

Use local state (omit `urlState`) when several tables share a page and would collide on `page`/`sort` —
see the per-group tables in `browse/$department/index.tsx`. Prefixed per-group keys were considered
and rejected as not worth the noise.

## Recipes

**Search across several fields.** The default global filter is per-column `includesString`, so a cell
that renders name *and* email only matches on its accessor. Pass `searchFn: (row, query) => …` and it
replaces the default with a row-level predicate. `query` arrives lowercased and trimmed.

**A table with no pagination** (a short, complete list): `showPagination={false}` and
`pageSize: Math.max(rows.length, 1)`. The `max` matters — a page size of 0 breaks the row model.

**Several tables on one page.** Hooks cannot run in a `.map()`, so extract a child component that
calls `useDataTable` once and render it per group. Build the column defs once in the parent and pass
them down. Examples: `CourseGroupTable`, `ClassTable`.

**A server-driven table** (`/search/*`): pass `manual: { pageCount, rowCount }`. That switches
`manualPagination`, `manualSorting` and `manualFiltering` all on, so the table renders `data` verbatim
and only drives the pagination UI. **Mark every column `enableSorting: false`** unless the API really
accepts a sort parameter — a header that sorts nothing is worse than no header control.

**A filter the table cannot own** — one that maps to a *set* of values rather than a column value,
like `open` = `PENDING | NEEDS_REVISION` in `/admin/requests`. Keep it as page state, put it in the
URL yourself, and pass the control through the toolbar's `filters` slot so it still looks like part
of the table.

## Traps

**`filterFn: "facet"` on every faceted column.** It is ours (`facet-filter.ts`), registered in
`features.ts`, and it is a superset of the built-in `arrHas`: a bare value list means "row value is one
of the selected", and a leading `!` on the first token negates the whole selection. Anything else is
wrong. `arrIncludesSome` starts with `if (!Array.isArray(dataValue)) return false` — it is for columns
whose *row value* is an array, so against our scalar facets it silently matches nothing. `arrIncludes`
does a substring match, so filtering `ADMIN` would also return `SUPERADMIN`. And leaving `filterFn` off
is equally broken: auto-resolution sees a string row value and picks `includesString`, which can never
match an array of selected values. `arrHas` still works but loses the exclude operator — do not reach
for it in new code.

**Facet values must be strings.** A boolean column filtered from the URL receives `["true"]` and
never matches. Project it instead:
`column.accessor(s => (s.isPublic ? "public" : "private"), { id: "visibility", … })`.

**Column defs need a stable identity.** Module scope when they close over nothing, `useMemo`
otherwise. A fresh array on every render makes TanStack rebuild every column and row model. `useState`
setters are stable, so `useMemo(() => buildColumns(setDeleteId), [])` is honest.

**Display columns can never sort** (`getCanSort` requires an `accessorFn`), so `enableSorting: false`
on a `column.display` is noise. Do set `enableHiding: false` on an actions column.

**`tsc` proves nothing about filter or sort behaviour.** Both traps above compile perfectly and fail
silently at runtime. Check them the way the `arrHas` bug was found: read the built-in's source in
`node_modules/@tanstack/table-core/dist/features/column-filtering/filterFns.js`, or render the hook in
a throwaway jsdom vitest config and assert on `table.getRowModel().rows`.

## TanStack Table v9, not v8

The installed version is **9.x**, a redesign. Every shadcn, openstatus or blog snippet you will find
is v8 and does not transfer:

| v8 | v9 |
|---|---|
| `getCoreRowModel()` etc. passed to `useReactTable` | features declared once in `tableFeatures({…})` with row-model factories |
| `useReactTable` | `useTable` |
| `table.getState()` | `table.state` (state lives in a TanStack Store) |
| `sortingFn` | `sortFn` |
| `ColumnMeta` via global declaration merging | the `columnMeta` / `tableMeta` slots on the features object |

Only the features listed in `features.ts` exist on the instance — no grouping, expanding, pinning or
resizing. Adding one means registering the feature *and* its row-model factory there; that is the only
place it belongs, so every table keeps the same capabilities and the bundle stays honest.

When in doubt read the installed `.d.ts` files rather than the docs site.

## Storybook

`DataTable` stories render (`Data Table/DataTable`: Admin, Browse, Empty) — it pulls no server
function. `<Link>` works in any story because `.storybook/router-decorator.tsx` mounts a
memory-history router globally; a component that reaches a `createServerFn` still cannot be storied.

## Before calling it done

```
pnpm exec tsc --noEmit
pnpm test
pnpm build-storybook
pnpm build:dev
```

Then, because none of the above exercises a filter: **click each faceted filter in the browser** and
confirm it narrows rather than empties the table. Also check the page survives a refresh and a back
button, since that is the whole point of the URL state.

If the route has a `pendingComponent`, update the matching skeleton in `src/components/skeletons/` —
the toolbar layout (search + facet buttons + column menu) is what the skeleton has to mirror.
