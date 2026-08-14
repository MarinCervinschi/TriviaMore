---
name: storybook
description: How Storybook is set up and how stories are written in TriviaMore — the two story shapes, the title taxonomy, what the global decorators already provide, which components cannot be storied and what to do instead, and how to actually verify a story renders. Use whenever adding or fixing a story, adding a component that should have one, or touching anything under .storybook/.
---

# Storybook

Storybook 10.5.7 on `@storybook/react-vite`, addons `a11y`, `docs`, `themes`.
`pnpm storybook` to run, `pnpm build-storybook` to check it compiles — the build is
part of the verification gate for any UI change.

Stories are **co-located** with the component: `button.tsx` → `button.stories.tsx`.
There are 370 across 93 sidebar entries: every `ui/` primitive, and every shared
component that is not on the short list at the bottom of this file.

## The setup, and why it is separate

`.storybook/vite.config.ts` is a **dedicated, minimal Vite config**, wired in through
`framework.options.builder.viteConfigPath`. Storybook must never load the app's
TanStack Start + Nitro pipeline — the same reasoning as the separate
`vitest.config.ts`. It carries three things that matter:

- a `resolveId` plugin mapping `@tanstack/react-start*` → `stub-react-start.ts`,
  `node:async_hooks` → `stub-async-hooks.ts`, and `#tanstack-*` /
  `tanstack-start-*` → `stub-empty.ts`;
- `stubServerApi()`, which replaces the *body* of every `src/lib/*/api/*` module
  with same-named throwing exports — see below;
- `optimizeDeps.exclude` for `pg`, `pg-types`, `postgres-bytea`, `drizzle-orm`.
  **Without it the dev server pre-bundles `pg` and every story dies on
  `Buffer is not defined`,** while `build-storybook` stays green because Rollup
  tree-shakes the handler bodies. That asymmetry is the trap.

`.storybook/preview.tsx` gives every story, for free:

| | |
|---|---|
| `globals.css` + DM Sans / DM Serif Display | the real tokens, so a story is not "close to" the app |
| `withThemeByClassName` | light/dark from the toolbar, toggling the app's own `.dark` class |
| `QueryClientProvider` + `SeededQueries` | retries off, and `parameters.session` / `parameters.queryData` seeded — see below |
| `withTheme` | the `ThemeContext`, so `useTheme` works — see below |
| `withRouter` | a memory-history router, so `<Link>` works — see below |
| a padded `bg-background` wrapper | stories sit on the app surface, not on white |

`a11y` runs as `test: "todo"`: violations are surfaced, never fail the build. It is
the safety net for the restyle, not a gate.

## The two shapes

**Args-driven — for anything whose props are plain values.** This is the default,
and it is what `autodocs` needs to generate a useful page. 43 of 53 stories.

```tsx
const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Variants: Story = { render: args => <>…</> };
```

**Render-only — when a required prop cannot be an arg.** A `DataTable` needs a table
instance from `useDataTable`; a chart needs a hook-built config. Naming `component`
then makes `args` required and the story will not typecheck.

```tsx
const meta = {
  title: "Data Table/DataTable",
  parameters: { layout: "padded" },
} satisfies Meta;          // no `component`, no autodocs

export default meta;
type Story = StoryObj<typeof meta>;

function AdminExample() {           // a component, so hooks are legal
  const table = useDataTable({ … });
  return <DataTable table={table} … />;
}

export const Admin: Story = { render: () => <AdminExample /> };
```

Hooks cannot run in a `render` arrow directly — wrap them in a component, as above.

## Titles

`UI/<Primitive>` for `components/ui/`. Everything else is `<Area>/<Name>`:
`Charts/*`, `Data Table/*`, `Requests/*`, `Stat Cards/*`, `Question Cards/*`,
`Launch Cards/*`, `Admin/*`, `Browse/*`, `Quiz/*`, `Flashcard/*`, `Layout/*`,
`Skeletons/*`, `Notifications/*`.

**Keep the granularity coarse.** One entry per area, several stories inside it — not
one entry per file. A story file covering five small components under one title is the
shape asked for; nine sibling entries in the sidebar is not. `Admin/Chrome`,
`Shared/Blocchi` and `Skeletons/Pagine` are the pattern.

**Group siblings under one title prefix on purpose.** `Stat Cards/*` and
`Question Cards/*` exist because two near-duplicate components were being compared
before being merged — the sidebar puts them next to each other. Reach for that
whenever you suspect duplication. `Page Headers/Confronto` renders the same content
through all four page headers for exactly this reason.

Story names are in Italian, like the UI: `name: "La pagina vuota"`.

## Components that fetch

**This used to be a hard wall and is not any more.** Importing a `createServerFn`
API — usually through `queries.ts` / `mutations.ts` — dragged Start's *server*
runtime into the bundle, and the build died on `node:async_hooks` and the
`tanstack-start-manifest:v` virtual.

`stubServerApi()` in `.storybook/vite.config.ts` replaces every module under
`src/lib/*/api/` with same-named exports that **throw when called**. Imports resolve,
`queries.ts` and `mutations.ts` load, nothing server-side is bundled. So a story
supplies the data instead:

```tsx
const meta = {
  title: "Notifications/Notifiche",
  parameters: {
    session: { role: "SUPERADMIN" },                    // signs the story in
    queryData: [[["notifications"], NOTIFICATIONS]],    // the exact query key
  },
} satisfies Meta;
```

`session` seeds `["auth", "session"]`, which is what `useAuth` reads; `queryData` is a
list of `[queryKey, data]` pairs. **Read the key off `queries.ts` — a near-miss key
silently leaves the component in its loading state**, and `useSuspenseQuery` will hang
on a suspense boundary rather than error.

A mutation still throws if you click it, and that is deliberate: the story is honest
about what it does not have. Say so in the story's doc comment where it matters
(the auth forms, the request form).

Extracting a presentational core is still often the right call — it is what made the
question cards, launch cards and session dialogs comparable — but it is now a design
decision, not a workaround.

## `<Link>` and the router

Works in any story: `.storybook/router-decorator.tsx` mounts a throwaway
memory-history router whose only route is the story itself, applied globally.

The app's real route tree is deliberately **not** loaded — importing it pulls Start's
server entries. So links render as plain hrefs and navigate nowhere, which is what a
component story wants. Note this only works with a **bare** `createRouter` from
`@tanstack/react-router`; reusing the app's own router factory reintroduces the wall.

`parameters.path` sets the memory history's entry, which is what a component calling
`useMatchRoute` needs to show an active state — `path: "/admin"` for the admin
sidebar, `path: "/browse"` for the navbar.

## The theme, and `useTheme`

`useTheme` → `useThemeContext` **throws** without a provider, so anything containing a
`ThemeToggle` (the navbar, the sidebar, the mobile nav, `AuthCard`) crashed at render
while `build-storybook` stayed green.

`.storybook/theme-decorator.tsx` supplies the context from the theme toolbar instead of
mounting the app's `ThemeProvider`. **Do not mount the real one:** it writes `.dark` on
`<html>`, which is exactly what `withThemeByClassName` owns, and the two fight on load.
`ThemeContext` is exported from `src/providers/theme-provider.tsx` for this decorator
and nothing else.

## Viewport

Storybook 10 reads the viewport from **globals, not parameters**. The Storybook 7
`parameters.viewport.defaultViewport` is silently inert:

```tsx
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6" } },
};
```

## Fixtures must be deterministic

No `Math.random()`, no argless `new Date()`. A story that reshuffles on every render
is useless for comparing two variants, and it makes any visual diff noise. Seed from
a constant — see `src/components/charts/fixtures.ts`, where a year of study days is
generated from a fixed seed and the calendar's end date is an explicit argument.

## Verifying a story actually renders

`pnpm build-storybook` proves the story **compiles**. It does not prove it renders —
that gap once hid a `<Link>` crashing every story that used one.

To really check, build a throwaway harness: a vitest config with `environment:
"jsdom"`, then `composeStories` + `setProjectAnnotations(preview)` so the real global
decorators apply, and assert the error boundary never appears.

```tsx
setProjectAnnotations([preview as never]);
const modules = import.meta.glob("./**/*.stories.tsx", { eager: true });
// render every composed story, assert on container.innerHTML
```

jsdom needs `matchMedia`, `scrollIntoView` and `ResizeObserver` stubbed first, or
`EmptyState`, `command` and `slider` fail for reasons that have nothing to do with
your change. `sonner` fails regardless (it reaches `localStorage`) — that one is
expected.

**⚠️ This harness cannot verify a Recharts chart.** `ResponsiveContainer` measures
0×0 in jsdom and draws no SVG at all, logging *"The width(0) and height(0) of chart
should be greater than 0"*. A green run means "did not crash", not "drew". CSS-grid
components like the heatmaps *do* verify properly — assert on the cell count.

Delete the harness afterwards: component tests are deliberately out of scope (#109),
and a half-kept one rots.

## What still has no story, and why

Five exports, all of them for a reason — do not "fix" these:

| | |
|---|---|
| `analytics/umami-analytics.tsx` | injects a `<script>`, renders nothing |
| `charts/chart-defs.tsx` — `ChartDefs`, `AreaFadeDefs` | SVG `<defs>`; invisible outside a plot, covered through `Charts/Fills` |
| `charts/chart-card.tsx` — `CHART_PLOT_CLASS` | a class-name string |
| `shared/content-hierarchy-diagram.tsx` — `CONTENT_LEVELS` | the data behind the diagram |
| `data-table/fixtures.tsx` — `DIFFICULTY_LABELS` | a fixture constant |

One more compiles but **cannot be judged from a green build**: the two campus maps draw
on Leaflet tiles. Their stories exist; only the browser tells you whether they paint.

## Before calling it done

```
pnpm exec tsc --noEmit
pnpm build-storybook
```

Then: open the story, **toggle the theme in the toolbar**, and look at it. Dark mode
is where token mistakes surface — a hardcoded hex looks fine in light and wrong in
dark, which is exactly how the grade colours and the chart palette bugs survived.
