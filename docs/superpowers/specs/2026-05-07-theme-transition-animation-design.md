# Theme Transition Animation — Design Spec

**Date:** 2026-05-07
**Status:** Approved (pending implementation plan)
**Owner:** marin.cervinschi

## Problem

The current theme switcher (`src/providers/theme-provider.tsx` + `src/components/layout/theme-toggle.tsx`) toggles between light and dark with no transition. The provider deliberately disables CSS transitions during `applyTheme` to avoid the cross-color flicker problem, leaving the swap visually abrupt. The same Sun/Moon button pattern is duplicated across 6 components, making any UX change a multi-file edit.

## Goal

Add a bold, modern animation when the user switches theme — without reintroducing the global CSS-transition flicker, and with one shared component used everywhere.

## Approach (chosen)

Three independent layers:

1. **Global circular reveal** via the View Transitions API: the new theme is unveiled with a `clip-path: circle(...)` expanding from the click point (~300ms ease-out).
2. **Icon morph** inside the button: Sun and Moon icons are both mounted, animated with Tailwind `dark:` rotate/scale classes. Pure CSS, no JS.
3. **Unified `<ThemeToggle>` component**: single source of truth used in all 6 current locations.

The three layers degrade independently: if View Transitions is unsupported, the icon still rotates; if `prefers-reduced-motion` is set, neither animates.

### Why this combo

- Matches the "bold redesign" preference (recorded in feedback memory) without being gimmicky.
- Doesn't fight the existing `applyTheme` pattern — View Transitions works on DOM snapshots, independent of CSS transitions.
- 300ms snappy timing keeps the app feeling responsive (Apple/Linear-style).
- Refactoring the 6 duplicate toggles into one component aligns with the user's preference to refactor when touching code.

## Architecture

### New files

#### `src/lib/theme-transition.ts`

```ts
type Origin = { x: number; y: number } | null

export function runThemeTransition(
  update: () => void,
  origin: Origin,
): void
```

Behavior:
- If `document.startViewTransition` is missing → call `update()` directly, return.
- If `prefers-reduced-motion: reduce` matches → call `update()` directly, return.
- Otherwise: write `--theme-cx` and `--theme-cy` CSS custom props on `document.documentElement` from `origin` (fallback: viewport center). Then call `document.startViewTransition(update)`.

The CSS keyframes consume `--theme-cx/--theme-cy` to anchor the circle.

### Modified files

#### `src/hooks/useTheme.ts`

`toggleTheme` signature changes from `() => void` to `(event?: React.MouseEvent) => void`. Internally it extracts `clientX/clientY` from the event (if present) and passes them to `runThemeTransition`, which wraps the existing `setTheme` call.

The pre-mount stub keeps a no-op `toggleTheme`.

`setLightTheme`, `setDarkTheme`, `setSystemTheme` remain unanimated — they're rarely called from a click and don't have reliable origin coordinates. Only `toggleTheme` triggers the reveal.

#### `src/components/layout/theme-toggle.tsx`

Becomes the unified component used everywhere. Props:

```ts
interface ThemeToggleProps {
  variant?: ButtonProps["variant"]   // default: "ghost"
  size?: ButtonProps["size"]          // default: "icon"
  className?: string
  iconSize?: string                   // tailwind size, default: "h-4 w-4"
  label?: string                      // optional text next to icon (sidebar use case)
  strokeWidth?: number                // default: 2
}
```

Internals:
- Stack of `<Sun>` and `<Moon>` (always mounted) with Tailwind classes:
  - Sun: `rotate-0 scale-100 dark:-rotate-90 dark:scale-0`
  - Moon: `rotate-90 scale-0 dark:rotate-0 dark:scale-100`
  - Both: `transition-transform duration-300 motion-reduce:transition-none`
- `onClick` receives the `MouseEvent` and forwards it to `toggleTheme(event)`.
- The pre-mount disabled state is preserved.

#### `src/styles/globals.css`

Add the View Transitions keyframes (this is the global stylesheet, alongside `src/styles/markdown.css`):

```css
::view-transition-old(root) {
  animation: none;
}

::view-transition-new(root) {
  animation: theme-reveal 300ms cubic-bezier(0.4, 0, 0.2, 1);
  clip-path: circle(0% at var(--theme-cx, 50%) var(--theme-cy, 50%));
}

@keyframes theme-reveal {
  from { clip-path: circle(0% at var(--theme-cx, 50%) var(--theme-cy, 50%)); }
  to   { clip-path: circle(150% at var(--theme-cx, 50%) var(--theme-cy, 50%)); }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-new(root),
  ::view-transition-old(root) {
    animation: none;
  }
}
```

The `150%` end radius guarantees the circle covers any viewport regardless of where the click originated.

#### Refactored consumers (5 files)

Each replaces its inline Sun/Moon button with `<ThemeToggle ...>`:

| File | Current pattern | New props |
|---|---|---|
| `src/components/layout/luma-sidebar.tsx` | Button with icon + "Light mode"/"Dark mode" text label | `label="Light mode" / "Dark mode"`, `strokeWidth={1.5}`, `iconSize="size-[18px]"`, custom `className` |
| `src/components/auth/auth-card.tsx` | Icon-only ghost button | default props, custom `className` |
| `src/components/quiz/quiz-header.tsx` | Icon button wrapped in `<Tooltip>` | `<Tooltip>` stays in the parent; `<ThemeToggle>` is the trigger child |
| `src/components/flashcard/flashcard-header.tsx` | Icon button wrapped in `<Tooltip>` | same as above |
| `src/components/flashcard/flashcard-results.tsx` | Icon-only ghost button | default props, custom `className` |
| `src/components/layout/theme-toggle.tsx` | The component itself | n/a |

The `useTheme` import + local Sun/Moon imports are removed from each consumer; `ThemeToggle` encapsulates them.

### Unchanged

- `src/providers/theme-provider.tsx` — its `applyTheme` keeps disabling CSS transitions; View Transitions does its work outside that mechanism.
- System theme change listener — no animation (no click origin).

## Flow

```
user clicks any <ThemeToggle> in the app
        │
        ▼
onClick(event) → toggleTheme(event)
        │
        ▼
useTheme.toggleTheme reads event.clientX / clientY
        │
        ▼
runThemeTransition(() => setTheme(next), { x, y })
        │
        ├─ View Transitions API + no reduced-motion?
        │      ├─ writes --theme-cx, --theme-cy on <html>
        │      ├─ document.startViewTransition(update)
        │      ├─ browser snapshots old DOM
        │      ├─ update() runs → setTheme → applyTheme → <html> gets .dark
        │      ├─ browser snapshots new DOM
        │      └─ animates ::view-transition-new(root) clip-path 0% → 150% at (cx, cy), 300ms
        │
        └─ otherwise: update() runs synchronously, no reveal
        │
        ▼
Independently: <html>.dark class change triggers Tailwind dark: variants on
the Sun/Moon icons → they rotate/scale via CSS transition (300ms)
```

## Edge cases

- **Firefox (no View Transitions yet)**: graceful fallback to instant theme swap; icon rotation still works because it's pure CSS.
- **`prefers-reduced-motion: reduce`**: both reveal and icon rotation disabled (icon uses `motion-reduce:transition-none`; CSS media query disables `::view-transition-*` animations).
- **System theme change from the OS** (no click): no animation, identical to today.
- **Programmatic `setTheme("light"|"dark"|"system")`** without a click: no animation, instant swap (only `toggleTheme` animates).
- **Rapid successive clicks**: native View Transitions queueing handles it; no extra logic needed.
- **Pre-mount click** (impossible — button disabled until `mounted=true`): no-op, same as today.
- **Tooltip wrappers** (quiz-header, flashcard-header): `<Tooltip>` parent stays in the consumer; `<ThemeToggle>` is just the trigger child.

## Verification (manual, in browser)

User does the verification (per user preference recorded in feedback memory). Suggested checks:

1. Click toggle from the navbar (top-right): circle expands from top-right.
2. Click toggle from Luma sidebar (bottom-left): circle expands from bottom-left.
3. Click toggle inside quiz/flashcard header: tooltip dismisses, reveal works.
4. Click toggle inside auth card: works on auth route.
5. Toggle in DevTools: enable `prefers-reduced-motion` → no animation, instant swap.
6. Open Firefox (or DevTools "Disable View Transitions" if available) → instant swap, icon still rotates.
7. Toggle 5 times rapidly → no visual glitches, no stuck state.

Claude side: type-check + build clean (per user preference, Claude doesn't do browser verification).

## Out of scope (YAGNI)

- No animation when `setTheme("system")` is invoked.
- No global CSS color-variable transition (the original problem we're avoiding).
- No external animation libs.
- No theme persistence changes — `theme-provider.tsx` localStorage logic is untouched.
- No support for animating `system` theme auto-changes from the OS.

## Risks / Open questions

- The `150%` clip-path radius may need tuning if the toggle is ever placed in a corner of an extremely wide viewport — defensive default, can be revisited.
