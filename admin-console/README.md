# TriviaMore Console

The ops console: the owner's app for running and watching the jobs that keep TriviaMore's official data
current. It is deployed apart from the student app and reached only from the tailnet. The architecture and its
reasons are in [`docs/OPS_CONSOLE.md`](../docs/OPS_CONSOLE.md).

## Run it

From the repository root:

```bash
pnpm install
pnpm console:dev      # http://localhost:3100
pnpm console:build
```

Or from this folder: `pnpm dev`, `pnpm build`, `pnpm typecheck`.

## How it is built

Same stack as the app: TanStack Start (React 19, Vite, Nitro) and Tailwind v4.

- `~/…` is the console's own code, `@/…` is the app's `src/`. The console imports the app's design system
  (tokens, `ui/` primitives, the theme provider) instead of copying it, so a change there shows here too.
- `src/lib/nav.ts` is the whole navigation: the sections of the rail and the pages of each section's sidebar.
  A new page is a route under `src/routes/` plus an entry there.
- The section sidebar remembers whether it is open in the `console_section_sidebar` cookie, so the server
  renders it in the right state.

## The shell

- **Rail**: the sections as icons, always collapsed; the name shows on hover.
- **Inset panel**: the header (breadcrumb, ⌘K search, environment), then the section's own sidebar, which
  opens and closes from the grip on its edge, then the page.
- Below `md` the rail is replaced by a sheet with the whole navigation.

The pages are placeholders for now. Each one links to the issue of epic #188 that builds it.
