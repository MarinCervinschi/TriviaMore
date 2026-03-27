# TriviaMore — Design System Reference

> Reference for developers and LLMs working on the TriviaMore UI.
> This file is the **single source of truth** for design decisions, patterns, and conventions.

---

## Philosophy

**Bold, not incremental.** Every page and component should feel intentional, polished, and branded. When modifying UI, don't preserve existing structure for its own sake — rebuild with the design system in mind.

**For LLMs:** Before writing any UI code, use the `ui-ux-pro-max` skill for design intelligence (styles, color palettes, font pairings, UX guidelines). Browse [21st.dev/community/components](https://21st.dev/community/components/) for component inspiration — search by component type (e.g. "404", "empty state", "toast") and adapt patterns to our design tokens.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | React 19 + TanStack Start | SSR-enabled, file-based routing |
| Styling | Tailwind CSS 4 | Config via `@theme` in `globals.css`, no `tailwind.config.ts` |
| Components | Radix UI (shadcn/ui) | Headless primitives in `src/components/ui/` |
| Variants | class-variance-authority (CVA) | Used by Button, Badge |
| Class merging | `cn()` from `src/lib/utils` | `clsx` + `tailwind-merge` — use everywhere |
| Animation | Framer Motion v12 | Variants in `src/lib/motion.ts` |
| Icons | Lucide React | `strokeWidth={1.5}` for lighter feel |
| Toasts | Sonner | Configured in `src/components/ui/sonner.tsx` |
| Forms | React Hook Form + Zod | Schema-driven validation |
| Font | Poppins (400, 500, 600, 700) | Via `@fontsource/poppins`, set in `--font-sans` |

---

## Color Palette

All colors are HSL-based CSS variables defined in `src/styles/globals.css`.

### Core

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `hsl(10 76% 42%)` / `#d14124` | same | Brand color, CTAs, accents |
| `--background` | `hsl(0 0% 100%)` | `hsl(224 71% 4%)` | Page background |
| `--foreground` | `hsl(224 71% 4%)` | `hsl(210 20% 98%)` | Body text |
| `--muted` | `hsl(220 14% 96%)` | `hsl(215 28% 17%)` | Subtle backgrounds |
| `--muted-foreground` | `hsl(220 9% 46%)` | `hsl(218 11% 65%)` | Secondary text |
| `--border` | `hsl(220 13% 91%)` | `hsl(215 28% 17%)` | Borders |
| `--destructive` | `hsl(0 84% 60%)` | `hsl(0 62.8% 30.6%)` | Errors |
| `--ring` | `hsl(10 76% 42%)` | same | Focus rings (= primary) |

### Semantic (use directly, not via tokens)

| Color | Value | Usage |
|-------|-------|-------|
| Success | `green-500` | Correct answers, success toasts |
| Warning | `amber-500` | Timer warnings, caution toasts |
| Info | `blue-500` | Informational badges/toasts |

### Chart palette

5 chart tokens (`--chart-1` to `--chart-5`) with different palettes per theme. Keep as-is.

---

## Typography

| Level | Classes | Responsive |
|-------|---------|------------|
| Hero | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight` | Yes |
| Page title | `text-3xl font-bold tracking-tight sm:text-4xl` | Yes |
| Section title | `text-xl font-semibold` | — |
| Card title | `text-lg font-semibold tracking-tight` | — |
| Body | `text-base leading-relaxed` | — |
| Small | `text-sm text-muted-foreground` | — |
| Micro | `text-xs text-muted-foreground` | — |
| Gradient text | Add `gradient-text` class | — |

---

## Spacing & Layout

- **Max content width**: `max-w-7xl` (1280px)
- **Page padding**: `px-4 sm:px-6 lg:px-8`
- **Section spacing**: `py-16 sm:py-24` (large), `py-8 sm:py-12` (small)
- **Card grid gap**: `gap-4 sm:gap-6`
- **Card inner padding**: `p-6` or `p-6 sm:p-8`
- **Component spacing**: `space-y-4`
- **Container**: `.container` class (auto margins, responsive padding, 80rem max)

---

## Border Radius

| Element | Class | Size |
|---------|-------|------|
| Large containers, empty states | `rounded-3xl` | 24px |
| Cards, dialogs, toasts | `rounded-2xl` | 16px |
| Buttons, inputs, selects | `rounded-xl` | 12px |
| Tabs, small elements | `rounded-lg` | 8px |
| Badges, avatars, pills | `rounded-full` | — |
| Checkboxes | `rounded-sm` | 4px |

Base radius token: `--radius: 0.75rem` with computed variants (`--radius-sm` to `--radius-xl`).

---

## Shadows & Elevation

| Level | Class | Usage |
|-------|-------|-------|
| Base | `shadow-sm` | Cards at rest, inputs |
| Hover | `shadow-md` | Cards on hover |
| Elevated | `shadow-lg` | Modals, dropdowns, floating elements |
| CTA glow | `shadow-lg shadow-primary/25` | Primary buttons, important CTAs |
| Focus glow | `shadow-[0_0_12px_hsl(var(--ring)/0.15)]` | Focus-visible state |

**Card hover pattern**: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`

---

## Animation System

All motion utilities live in `src/lib/motion.ts`. Use framer-motion's `motion.*` components with these variants.

### Transition presets

| Name | Type | Duration | Usage |
|------|------|----------|-------|
| `springGentle` | spring | ~400ms | Default for entrances |
| `springSnappy` | spring | ~200ms | Hover/press feedback |
| `easeFade` | easeOut | 300ms | Opacity-only transitions |

### Variant collections

| Name | Effect | Usage |
|------|--------|-------|
| `fadeInUp` | opacity 0→1, y: 20→0 | General entrance |
| `fadeIn` | opacity 0→1 | Subtle reveals |
| `scaleIn` | opacity 0→1, scale 0.9→1 | Modals, hero elements |
| `slideInLeft` / `slideInRight` | x: ±30→0 with fade | Directional entrances |
| `staggerContainer` | orchestrator (stagger: 80ms, delay: 100ms) | Parent wrapper |
| `staggerItem` | fadeInUp child | Children inside stagger |

### Usage pattern

```tsx
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"

function MyComponent() {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.h1 variants={item}>Title</motion.h1>
      <motion.p variants={item}>Description</motion.p>
    </motion.div>
  )
}
```

### Scroll-triggered reveals

```tsx
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { fadeInUp, withReducedMotion } from "@/lib/motion"

function Section() {
  const prefersReduced = useReducedMotion()
  const { ref, isVisible } = useScrollReveal()
  const variants = withReducedMotion(fadeInUp, prefersReduced)

  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={isVisible ? "visible" : "hidden"}>
      ...
    </motion.div>
  )
}
```

### Decorative orb drift

For background blurred orbs, use infinite drift:

```tsx
<motion.div
  className="pointer-events-none absolute ... rounded-full bg-primary/10 blur-[80px]"
  animate={prefersReduced ? undefined : { x: [0, 15, 0], y: [0, -10, 0] }}
  transition={prefersReduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## Global CSS Classes

Defined in `src/styles/globals.css`:

| Class | Purpose |
|-------|---------|
| `.dot-pattern` | Radial gradient dot grid (24px spacing, foreground at 6% opacity) |
| `.gradient-bg` | Linear gradient 135deg `#d14124` → `#f56565` |
| `.gradient-text` | Gradient applied as text fill via `background-clip: text` |
| `.shimmer` | Animated shimmer gradient for skeleton loaders |
| `.fade-in` | Simple 0.5s fade-in with translateY |
| `.auth-glass-effect` | Glassmorphism: `backdrop-filter: blur(16px) saturate(180%)` |
| `.flashcard` / `.flashcard-inner` | 3D flip with perspective 1000px |
| `.quiz-progress` | Gradient progress bar |

---

## Background System

**Never use plain mono-color backgrounds.** Every page/section uses layered backgrounds:

1. **Base**: warm gradient or `bg-background`
2. **Dot pattern**: `.dot-pattern` overlay at 40-50% opacity
3. **Decorative orbs**: Absolute-positioned blurred circles (`bg-primary/8-10 blur-[60-100px]`)
4. **All behind content**: `pointer-events-none absolute inset-0 -z-10`

Example:
```tsx
<div className="pointer-events-none absolute inset-0 -z-10">
  <div className="absolute inset-0 dot-pattern opacity-40" />
  <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
</div>
```

---

## Component Patterns

### Cards

```
rounded-2xl border bg-card p-6 transition-all duration-300
hover:-translate-y-1 hover:shadow-xl  (when interactive)
```

### Empty states

Use the unified `EmptyState` component from `src/components/ui/empty-state.tsx`:

```tsx
import { EmptyState } from "@/components/ui/empty-state"
import { SearchX } from "lucide-react"

<EmptyState
  icon={SearchX}
  title="Nessun risultato"
  description="Prova a cercare qualcos'altro"
  actionLabel="Esplora"
  actionHref="/browse"
/>
```

### Toast notifications

Sonner is pre-configured in `src/components/ui/sonner.tsx` with:
- `rounded-2xl`, `backdrop-blur-sm`
- 5s duration (WCAG minimum), close button
- Type-specific left accent border (green/red/amber/blue)

### Loading states

- **Page loading**: `LoadingPage` component (branded spinner + orbs)
- **Inline loading**: `LoadingSpinner` with `size="sm" | "default" | "lg"`
- **Skeleton placeholders**: `Skeleton` component uses shimmer animation

---

## Accessibility Rules

1. **Reduced motion**: Always wrap animations with `useReducedMotion()` + `withReducedMotion()`. CSS animations are globally suppressed via `@media (prefers-reduced-motion: reduce)` in globals.css.
2. **Focus states**: All interactive elements have `focus-visible:ring-2 focus-visible:ring-ring` + glow shadow. Never remove focus outlines.
3. **Touch targets**: Minimum 44px on touch devices (enforced via `@media (pointer: coarse)` in globals.css).
4. **Contrast**: WCAG AA minimum (4.5:1 for text). Primary color stays the same in both themes.
5. **Language**: UI text is in Italian. Code comments must be in English.
6. **Screen readers**: Use `aria-hidden` on decorative elements, proper `role` attributes on skeletons.

---

## Dark Mode Rules

- Never use pure black (`#000`) — use the deep navy `--background`
- Cards: slightly lighter than background + subtle border
- Primary color is the same in both themes
- Reduce shadow intensity, increase border visibility
- Decorative orbs: lower opacity in dark mode (`/8` instead of `/10`)
- Scrollbar: custom styled per theme in globals.css
- All `.dark` variants are defined alongside `:root` in globals.css

---

## Icons

- **Library**: Lucide React
- **Inline**: `size-4` (16px) or `h-4 w-4`
- **Buttons**: `size-5` (20px) or `h-5 w-5`
- **Decorative/hero**: `size-8`+ (32px+)
- **Stroke**: `strokeWidth={1.5}` for a lighter, modern feel
- **Badge icons**: Icon inside `rounded-2xl bg-primary/10 p-3-4` container

---

## File Organization

```
src/
├── components/
│   ├── ui/           # Primitives (button, card, input, empty-state, skeleton...)
│   ├── layout/       # Navbar, footer, sidebar
│   ├── landing/      # Landing page sections
│   ├── auth/         # Auth forms
│   ├── browse/       # Browse hierarchy
│   ├── quiz/         # Quiz session
│   ├── flashcard/    # Flashcard session
│   ├── user/         # User section wrappers
│   ├── admin/        # Admin section
│   ├── error/        # Error/404 pages
│   └── loading/      # Loading page
├── hooks/            # useReducedMotion, useScrollReveal, useTheme, useAuth
├── lib/              # motion.ts, utils.ts, and domain logic
├── styles/           # globals.css, markdown.css
└── routes/           # TanStack Router file-based routes
```

---

## LLM-Specific Guidance

### Before writing any UI code

1. **Read this file** for design tokens, patterns, and conventions
2. **Use the `ui-ux-pro-max` skill** for design intelligence — it has 50+ styles, 161 color palettes, UX guidelines, and component patterns for shadcn/ui + Tailwind
3. **Browse [21st.dev](https://21st.dev/community/components/)** for component inspiration — search by type ("modal", "card", "navigation") and adapt to our tokens
4. **Use the `find-docs` skill** for up-to-date Tailwind CSS 4, Framer Motion, or Radix UI documentation

### When creating new components

- Use `cn()` for all class merging
- Follow CVA pattern for components with variants (see `button.tsx`)
- Always support `className` prop for composition
- Wrap animations with `useReducedMotion()` guard
- Support both light and dark themes
- Use existing motion variants from `src/lib/motion.ts` — don't create inline variants
- Use `EmptyState` for empty/no-data states — don't create ad-hoc ones

### When modifying existing components

- Read the component first — understand its props and usage
- Preserve the public API (props interface) unless changing it is the goal
- Check all consumers with grep before changing props
- Test both themes
- Don't add complexity beyond what's needed

### Common mistakes to avoid

- Using `animate-pulse` instead of `shimmer` for skeletons
- Forgetting `pointer-events-none` on decorative elements
- Using plain backgrounds without dot-pattern/orbs
- Hardcoding colors instead of using CSS variable tokens
- Skipping `useReducedMotion` for new animations
- Adding `rounded-md` (the old default) instead of `rounded-xl`/`rounded-2xl`
- Using generic Loader2 spinner instead of `LoadingSpinner` component
