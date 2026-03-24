# TriviaMore

Quiz and flashcard platform for better studying.

## Stack

- [TanStack Start](https://tanstack.com/start) + [Vite](https://vite.dev)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (New York style, Radix UI)
- [TanStack React Query](https://tanstack.com/query) with persistent caching
- [Infisical](https://infisical.com) for secrets management

## Setup

```bash
# Install dependencies
pnpm install

# Login to Infisical (first time only)
infisical login
infisical init

# Start the dev server (injects secrets from Infisical)
pnpm dev

# Start without secrets (for pure UI testing)
pnpm dev:no-secrets
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm build` | Production build with secrets |
| `pnpm preview` | Preview the production build |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build:no-secrets` | Build without Infisical |
| `pnpm test` | Run tests with Vitest |

## Project Structure

```
src/
├── routes/              File-based routing (TanStack Router)
│   ├── __root.tsx       Root layout (providers, toaster, devtools)
│   └── index.tsx        Home page
├── components/
│   └── ui/              34 shadcn/Radix components
├── providers/
│   ├── theme-provider   Dark mode (localStorage + .dark class)
│   └── react-query      Query client with persistent cache
├── hooks/
│   └── useTheme         Theme hook (isDark, toggleTheme, etc.)
├── lib/
│   └── utils            cn() for Tailwind classes, serializeId()
└── styles/
    ├── globals.css       CSS variables, @theme, custom styles
    └── markdown.css      Markdown/KaTeX rendering styles
```

## Branches

```
master          → Production (Next.js, untouched)
trivia-more-3.0 → Reference: Next.js code + migration roadmap
tanstack-start  → This branch (new project)
```

For migration details: [`docs/MIGRATION_STATUS.md`](docs/MIGRATION_STATUS.md)
