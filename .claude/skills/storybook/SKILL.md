---
name: storybook
description: How Storybook is set up and how stories are written in TriviaMore — the two story shapes, the title taxonomy, what the global decorators already provide, which components cannot be storied and what to do instead, and how to actually verify a story renders. Use whenever adding or fixing a story, adding a component that should have one, or touching anything under .storybook/.
---

# Storybook

Storybook 10.5.7 on `@storybook/react-vite`, addons `a11y`, `docs`, `themes`.
`pnpm storybook` to run, `pnpm build-storybook` to check it compiles — the build is
part of the verification gate for any UI change.

Stories are **co-located** with the component: `button.tsx` → `button.stories.tsx`.
There are 53 of them; every `ui/` primitive has one.

## The setup, and why it is separate

`.storybook/vite.config.ts` is a **dedicated, minimal Vite config** (only
`@tailwindcss/vite` + `vite-tsconfig-paths`), wired in through
`framework.options.builder.viteConfigPath`. Storybook must never load the app's
TanStack Start + Nitro pipeline — the same reasoning as the separate
`vitest.config.ts`. It also carries a `resolveId` plugin that stubs every
`#tanstack-*` / `tanstack-start-*` specifier to `.storybook/stub-empty.ts`.

`.storybook/preview.tsx` gives every story, for free:

| | |
|---|---|
| `globals.css` + DM Sans / DM Serif Display | the real tokens, so a story is not "close to" the app |
| `withThemeByClassName` | light/dark from the toolbar, toggling the app's own `.dark` class |
| `QueryClientProvider` | retries off, so a component using TanStack Query renders |
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
`Launch Cards/*`.

**Group siblings under one title prefix on purpose.** `Stat Cards/*` and
`Question Cards/*` exist because two near-duplicate components were being compared
before being merged — the sidebar puts them next to each other. Reach for that
whenever you suspect duplication.

## The hard limit: server-function coupling

**A component that transitively imports a `createServerFn` API cannot be storied.**
Importing it — usually through `queries.ts` / `mutations.ts` — drags TanStack Start's
*server* runtime into the client bundle, and the build dies on `node:async_hooks`
(`AsyncLocalStorage`) and the `tanstack-start-manifest:v` virtual, because Storybook
deliberately does not run the Start plugin.

**The fix is not a mock, it is a split: extract the presentational core.** A
props-only component renders in a story, and the extraction is usually the right
refactor anyway. That is how the question cards, launch cards and session dialogs
became story-able — the split *was* the de-duplication.

The `#tanstack-*` stub already unblocks the lighter cases (`@tanstack/react-router`
`<Link>`, hence `empty-state` and `admin-stat-card`). It is the server runtime that
is the wall.

## `<Link>` and the router

Works in any story: `.storybook/router-decorator.tsx` mounts a throwaway
memory-history router whose only route is the story itself, applied globally.

The app's real route tree is deliberately **not** loaded — importing it pulls Start's
server entries. So links render as plain hrefs and navigate nowhere, which is what a
component story wants. Note this only works with a **bare** `createRouter` from
`@tanstack/react-router`; reusing the app's own router factory reintroduces the wall.

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

## Before calling it done

```
pnpm exec tsc --noEmit
pnpm build-storybook
```

Then: open the story, **toggle the theme in the toolbar**, and look at it. Dark mode
is where token mistakes surface — a hardcoded hex looks fine in light and wrong in
dark, which is exactly how the grade colours and the chart palette bugs survived.
