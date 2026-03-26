# UI Redesign Plan — TriviaMore

## Context

TriviaMore is in the final migration phases (TanStack Start). The current UI is functional but lacks a polished, cohesive design. The goal is to elevate the entire UI with a more thoughtful, modern design system — using components from [21st.dev](https://21st.dev) as inspiration and leveraging the existing Radix + Tailwind + CVA stack.

This file serves as the **single source of truth** for all UI decisions, ensuring consistency across all phases.

---

## Design System Rules

### Color Palette

**Primary**: `hsl(10, 76%, 42%)` / `#d14124` — Warm orange-red (brand color, keep)
**Primary Hover**: `hsl(10, 76%, 36%)` — Slightly darker for hover states
**Primary Light**: `hsl(10, 76%, 95%)` — Very light tint for backgrounds/badges

**Neutral Scale** (refined):
- `--background`: Pure white `hsl(0, 0%, 100%)` light / Deep `hsl(224, 71%, 4%)` dark
- `--foreground`: `hsl(224, 71%, 4%)` light / `hsl(210, 20%, 98%)` dark
- `--muted`: `hsl(220, 14%, 96%)` light / `hsl(215, 28%, 17%)` dark
- `--muted-foreground`: `hsl(220, 9%, 46%)` light / `hsl(218, 11%, 65%)` dark
- `--border`: `hsl(220, 13%, 91%)` light / `hsl(215, 28%, 17%)` dark

**Accent Colors** (for status/feedback):
- Success: `hsl(142, 71%, 45%)` — Green for correct answers
- Warning: `hsl(38, 92%, 50%)` — Amber for time warnings
- Destructive: `hsl(0, 84%, 60%)` — Red for errors/wrong answers
- Info: `hsl(217, 91%, 60%)` — Blue for informational badges

**Chart palette**: Keep current warm-to-cool gradient palette.

### Typography

**Font stack**:
- Headings: `Poppins` (geometric sans-serif with personality, rounded and friendly)
- Body: `Poppins`
- Mono: `JetBrains Mono` (for code blocks, quiz answers, technical content)
- Load via `@fontsource/poppins` (self-hosted, weights: 400, 500, 600, 700)

**Type scale** (consistent across app):
- Hero: `text-5xl font-bold tracking-tight` (mobile: `text-3xl`)
- Page title: `text-3xl font-bold tracking-tight`
- Section title: `text-xl font-semibold`
- Card title: `text-lg font-semibold`
- Body: `text-base font-normal` with `leading-relaxed`
- Small/Caption: `text-sm text-muted-foreground`
- Micro: `text-xs text-muted-foreground`

Note: Poppins has letterforms piu' arrotondate rispetto a Inter, che si sposano bene con lo stile "Modern & Vibrant" e con il tema educational/quiz dell'app.

### Spacing & Layout

- Max content width: `max-w-7xl` (1280px) — keep
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `py-16 sm:py-24` (large sections), `py-8 sm:py-12` (smaller)
- Card gap in grids: `gap-6`
- Inner card padding: `p-6`
- Component spacing (within cards): `space-y-4`

### Border Radius

- Cards/Containers: `rounded-2xl` (16px) — upgrade from current `rounded-xl`
- Buttons/Inputs: `rounded-xl` (12px) — upgrade from `rounded-md`
- Badges/Tags: `rounded-full`
- Small elements (checkboxes): `rounded-md`

### Shadows & Elevation

**Light theme layers:**
- `shadow-sm`: Subtle cards (`0 1px 2px rgba(0,0,0,0.05)`)
- `shadow-md`: Elevated cards on hover (`0 4px 6px -1px rgba(0,0,0,0.1)`)
- `shadow-lg`: Modals, dropdowns (`0 10px 15px -3px rgba(0,0,0,0.1)`)

**Dark theme**: Reduce shadow intensity, use border emphasis instead.

**Card hover effect**: `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`

### Animations & Transitions

- **Default transition**: `transition-all duration-200 ease-out`
- **Card hover**: `transition-all duration-300 ease-out` with shadow + translate
- **Page transitions**: Subtle fade-in (`animate-in fade-in-0 duration-300`)
- **Skeleton loaders**: Pulse animation on content areas
- **Flashcard flip**: Keep existing 3D transform (0.6s) — it works well
- **Staggered entry**: Cards in grids appear with 50ms stagger delay
- **No excessive motion**: Respect `prefers-reduced-motion`

### Icons

- **Library**: Lucide React (keep, already installed)
- **Size**: `size-4` (16px) inline, `size-5` (20px) buttons, `size-8`+ (32px+) decorative
- **Style**: Consistent `strokeWidth={1.5}` for a lighter, modern feel

### Style Direction: Modern & Vibrant — BOLD redesign

The redesign must be **total, not incremental**. Each page should be completely rethought with new layouts, new compositions, bold visual identity. Don't preserve existing structure — rebuild from scratch using existing data/props.

### Background System (NO flat mono-color backgrounds)

Every page uses a **rich, textured background** — never plain white/dark:

**Light mode base**: Warm off-white with mesh gradient overlay
```css
background: #fafaf9;
/* Overlay with radial gradients using primary color at low opacity */
```

**Dark mode base**: Deep navy with subtle aurora/mesh gradient
```css
background: hsl(224 71% 4%);
/* Overlay with radial gradients using primary color warmth */
```

**Dot grid pattern** (reusable): CSS background-image with tiny dots for texture
```css
background-image: radial-gradient(circle, hsl(var(--foreground) / 0.07) 1px, transparent 1px);
background-size: 24px 24px;
```

**Mesh gradient blobs**: Multiple absolute-positioned blurred circles with primary/accent colors at very low opacity, creating depth without distraction.

### Glass & Decorative Effects

- **Glass cards** (auth, special sections): `backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20`
- **Gradient text** (hero, CTAs): `bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent`
- **Glow effects**: `shadow-primary/20` on primary buttons, `shadow-primary/10` on cards
- **Glassmorphism**: Used sparingly for auth cards, floating elements, navbar
- **Animated gradient orbs**: Slow-moving blurred circles in hero sections for dynamism

### Custom SVG Illustrations

- Create simple, branded SVG illustrations for:
  - 404 page (lost quiz character or empty desk)
  - Empty states (no bookmarks, no classes, no progress)
  - Auth pages (decorative background elements)
  - Landing hero (abstract shapes or quiz-themed illustration)
- Style: Flat/geometric, using primary palette (orange/red + neutrals)
- Keep SVGs lightweight (<5KB each), inline where possible
- Consistent visual language across all illustrations

### Dark Mode Rules

- Never use pure black (`#000`), use deep navy/charcoal
- Cards in dark mode: Slightly lighter than background with subtle border
- Primary color stays the same in both themes
- Text contrast: Always minimum WCAG AA (4.5:1)
- Reduce shadow intensity, increase border visibility

---

## Phase Overview

| # | Section | Priority | Scope | Status |
|---|---------|----------|-------|--------|
| 1 | Design System Foundation | Critical | Tokens, fonts, base components | Pending |
| 2 | Public Pages | High | Landing, About, Contact | Pending |
| 3 | Auth Pages | High | Login, Register | Pending |
| 4 | Navigation | High | Navbar, Footer, Sidebar | Pending |
| 5 | Browse Pages | High | Department -> Section hierarchy | Pending |
| 6 | Quiz & Flashcard | Critical | Game session UI | Pending |
| 7 | User Pages | Medium | Dashboard, Progress, Settings, Bookmarks, Classes | Pending |
| 8 | Admin Pages | Medium | Dashboard, CRUD tables, Forms | Pending |
| 9 | Polish & Micro-interactions | Low | Animations, loading states, error pages | Pending |

---

## Phase 1 — Design System Foundation

**Goal**: Update base tokens and primitive components so all subsequent phases inherit the new look.

### Files to modify:
- `src/styles/globals.css` — Update CSS variables, add new tokens
- `src/routes/__root.tsx` — Add font imports
- `src/components/ui/button.tsx` — Update radius, padding, shadow variants
- `src/components/ui/card.tsx` — Update radius, shadow, hover states
- `src/components/ui/input.tsx` — Update radius, focus ring style
- `src/components/ui/badge.tsx` — Update radius to pill shape
- `src/components/ui/dialog.tsx` — Update radius, animation
- `src/components/ui/select.tsx` — Update styling
- `src/components/ui/tabs.tsx` — Update active state styling
- `src/components/ui/skeleton.tsx` — Update animation
- `src/components/ui/table.tsx` — Update row hover, borders

### Tasks:
1. Install Poppins font (`@fontsource/poppins` — weights 400, 500, 600, 700)
2. Update `globals.css`: new radius values, refined neutrals, font-family
3. Update button variants: larger radius, refined shadows, size adjustments
4. Update card component: `rounded-2xl`, hover elevation effect
5. Update input/select/textarea: consistent `rounded-xl`, focus ring using primary color
6. Update badge: `rounded-full` pill shape
7. Update dialog: smoother enter/exit animations, `rounded-2xl`
8. Update table: cleaner borders, hover row highlight
9. Verify dark mode for every updated component

---

## Phase 2 — Public Pages

### 2A. Landing Page (Homepage)

**Files:**
- `src/routes/_app/index.tsx`
- `src/components/landing/hero-section.tsx`
- `src/components/landing/features-section.tsx`
- `src/components/landing/benefits-section.tsx`
- `src/components/landing/landing-footer.tsx`

**Current**: Basic hero + features + benefits sections.
**Target**: Modern, high-impact landing with visual polish.

**Tasks:**
1. **Hero Section**: Full-width, gradient background or subtle pattern. Large headline with gradient text. Subtitle with `text-muted-foreground`. Two CTAs (primary filled + secondary outline). Optional: Floating UI mockup/illustration.
2. **Features Section**: Icon + title + description cards in 3-column grid. Cards with hover elevation effect. Consider using a subtle background color difference.
3. **Benefits Section**: Alternating image-text layout or numbered steps. Strong CTA at the bottom.
4. **Landing Footer**: Multi-column footer with logo, links, social. Clean separator line. Copyright.
5. **Stats/Social proof**: Optional section with numbers (quiz completati, studenti, domande).

### 2B. About Page

**Files:**
- `src/routes/_app/about.tsx`

**Tasks:**
1. Clean hero with page title and subtitle
2. Mission card with icon or illustration
3. Values in a 2x2 or 4-column card grid with icons
4. Team/Tech section with clean layout
5. CTA section with gradient background

### 2C. Contact Page

**Files:**
- `src/routes/_app/contact.tsx`
- `src/components/contact/contact-form.tsx`

**Tasks:**
1. Two-column layout: form left, info cards right
2. Form with modern input styling (floating labels or clean labels above)
3. Info cards with icons (Bug, Feature, Contribute)
4. Success/error states with animations

---

## Phase 3 — Auth Pages

**Files:**
- `src/routes/auth/login.tsx`
- `src/routes/auth/register.tsx`
- `src/components/auth/auth-card.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/oauth-buttons.tsx`

**Current**: Glass morphism card with form.
**Target**: Centered card with refined glass effect, brand presence.

**Layout**: Centered card (no split layout).

**Tasks:**
1. Full-page centered layout with gradient background + SVG decorative elements
2. Auth card: Glass effect (`backdrop-blur-xl`), `rounded-2xl`, brand logo at top
3. Form inputs: Clean styling with Poppins, proper spacing, animated error states
4. OAuth buttons: Consistent sizing, icon + text, hover states with subtle shadow
5. Separator: Clean "oppure" divider with line + text
6. Link between login/register: Subtle, below card
7. Background: Warm gradient (primary tones) with floating geometric SVG shapes

---

## Phase 4 — Navigation

### 4A. Navbar

**Files:**
- `src/components/layout/navbar.tsx`

**Tasks:**
1. Sticky with `backdrop-blur-xl`, clean border-bottom
2. Logo: Brand mark + "TriviaMore" text
3. Nav links: Clean hover states with underline or indicator
4. Active state: Primary color indicator
5. User menu: Avatar dropdown with smooth animation
6. Mobile: Sheet/drawer with full navigation
7. Theme toggle: Clean icon button

### 4B. Footer

**Files:**
- `src/components/layout/footer.tsx`
- `src/components/layout/minimal-footer.tsx`
- `src/components/landing/landing-footer.tsx`

**Tasks:**
1. **Landing footer**: Multi-column with logo, nav links, social links, copyright
2. **App footer** (minimal): Simple copyright + essential links
3. Consistent styling between variants

---

## Phase 5 — Browse Pages

**Files:**
- `src/routes/_app/browse/index.tsx`
- `src/routes/_app/browse/$department/index.tsx`
- `src/routes/_app/browse/$department/$course/index.tsx`
- `src/routes/_app/browse/$department/$course/$class/index.tsx`
- `src/routes/_app/browse/$department/$course/$class/$section/index.tsx`
- `src/components/browse/*.tsx` (all browse components)

**Current**: Functional cards and grids.
**Target**: Visually rich browsing experience with clear hierarchy.

**Tasks:**
1. **Browse Hero**: Clean page header with title, description, stats inline
2. **Search/Filter bar**: Rounded input with icon, filter pills/tabs
3. **Department cards**: Large cards with icon/emoji, description preview, course count badge
4. **Course cards**: Type badge (Triennale/Magistrale) with color coding, class count
5. **Class cards**: Section count, question count, save/bookmark indicator
6. **Section page**: Two prominent action cards (Quiz + Flashcard) with icons and descriptions
7. **Breadcrumb**: Refined styling with chevron separators, truncation for long paths
8. **Empty states**: Illustrated empty states with helpful text
9. **Grid layout**: Responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with consistent gaps
10. **Card hover**: Elevation + subtle border color change

---

## Phase 6 — Quiz & Flashcard (Critical)

### 6A. Quiz Session

**Files:**
- `src/routes/quiz.$quizId.tsx`
- `src/components/quiz/quiz-header.tsx`
- `src/components/quiz/quiz-progress.tsx`
- `src/components/quiz/quiz-sidebar.tsx`
- `src/components/quiz/question-card.tsx`
- `src/components/quiz/quiz-navigation.tsx`
- `src/components/quiz/quiz-timer.tsx`
- `src/components/quiz/quiz-inline-results.tsx`
- `src/components/quiz/bookmark-button.tsx`
- `src/components/quiz/start-quiz-dialog.tsx`

**Tasks:**
1. **Start dialog**: Clean modal with mode selection (Studio/Esame), question count, estimated time
2. **Quiz layout**: Sidebar left (collapsible), main question area center
3. **Progress bar**: Smooth gradient, question counter text
4. **Timer**: Prominent but not distracting, warning state with color change (not pulse)
5. **Question card**: Clean card with question number, markdown content, answer options
6. **Answer options**: Radio/checkbox with clear selected state, hover highlight
7. **Navigation**: Bottom bar with Previous/Next, question dots for quick nav
8. **Sidebar**: Question grid with status indicators (answered, current, unanswered)
9. **Results inline**: Score card with celebration for good scores, detailed breakdown
10. **Bookmark button**: Heart icon with animation on toggle

### 6B. Quiz Results Page

**Files:**
- `src/routes/_app/quiz.results.$attemptId.tsx`

**Tasks:**
1. Score hero: Large score number with evaluation (Sufficiente, Ottimo, etc.)
2. Stats row: Correct, incorrect, time spent in compact cards
3. Question review: Expandable/collapsible per question
4. Color coding: Green correct, red incorrect, with explanation sections

### 6C. Flashcard Session

**Files:**
- `src/routes/flashcard.$sessionId.tsx`
- `src/components/flashcard/*.tsx`

**Tasks:**
1. **Card design**: Clean card with 3D flip animation (keep current transform approach)
2. **Card front**: Question with clean typography, "Tap to flip" hint
3. **Card back**: Answer with different background tint
4. **Progress**: Clean bar + "X di Y studiate" counter
5. **Navigation**: Swipe-friendly on mobile, keyboard on desktop
6. **Results**: Summary with studied count, option to restart

### 6D. Start Dialogs (Quiz & Flashcard)

**Files:**
- `src/components/quiz/start-quiz-dialog.tsx`
- `src/components/flashcard/start-flashcard-dialog.tsx`

**Tasks:**
1. Clean modal design with clear options
2. Mode selection with visual radio cards (not plain radios)
3. Question count/configuration
4. Clear CTA button

---

## Phase 7 — User Pages

**Files:**
- `src/routes/_app/user/index.tsx` (Dashboard)
- `src/routes/_app/user/progress.tsx`
- `src/routes/_app/user/settings.tsx`
- `src/routes/_app/user/bookmarks.tsx`
- `src/routes/_app/user/classes.tsx`
- `src/components/user/*.tsx`

**Tasks:**
1. **Dashboard**: Profile card with avatar, name, role. Stats in 4-column grid with icons. Quick actions as clean link cards. Recent activity timeline.
2. **Progress**: Chart section with proper card wrapping. Stats cards consistent with dashboard. Table with better row styling. Tabs with modern active state.
3. **Settings**: Form sections with clear headings. Avatar upload area. Grouped settings in cards.
4. **Bookmarks**: Card per question with clean badge styling. Collapsible explanation. Quick actions (remove, go to section).
5. **Classes**: Filter bar with dropdowns and search. Class cards with course info and actions. Empty state with illustration.

---

## Phase 8 — Admin Pages

**Files:**
- `src/routes/_app/admin/index.tsx`
- `src/routes/_app/admin/departments/*.tsx`
- `src/routes/_app/admin/courses/*.tsx`
- `src/routes/_app/admin/classes/*.tsx`
- `src/routes/_app/admin/sections/*.tsx`
- `src/routes/_app/admin/questions/*.tsx`
- `src/routes/_app/admin/users/*.tsx`
- `src/components/admin/*.tsx`

**Tasks:**
1. **Dashboard**: Stats cards in grid with trend indicators. Quick links to each section.
2. **List pages**: Clean table with better spacing. Search + filter bar at top. Bulk actions toolbar. Pagination with page numbers.
3. **Detail/Edit pages**: Form in card layout with clear sections. Preview of content where applicable.
4. **Sidebar**: Clean navigation with active state, section icons, collapsible groups.
5. **Forms**: Consistent field layout, validation states, submit loading states.
6. **Delete confirmations**: Clear warning dialog with destructive button styling.

---

## Phase 9 — Polish & Micro-interactions

**Files:**
- `src/components/error/error-page.tsx`
- `src/components/error/not-found-page.tsx`
- `src/components/loading/loading-page.tsx`
- `src/styles/globals.css`

**Tasks:**
1. **404 page**: Illustrated/branded 404 with search suggestion and home link
2. **Error page**: Clean error display with retry action
3. **Loading page**: Branded skeleton with logo animation
4. **Toast notifications**: Consistent styling matching design system
5. **Scroll animations**: Subtle fade-in on scroll for landing page sections
6. **Focus states**: Consistent focus-visible rings across all interactive elements
7. **Empty states**: Consistent illustration style across browse, user, admin
8. **Mobile polish**: Touch targets min 44px, proper mobile spacing

---

## Implementation Rules

1. **Bold, not incremental** — Each page redesign is a total rebuild, not small tweaks
2. **One phase at a time** — Complete and verify each phase before moving to the next
3. **Component-first** — Update base UI components (Phase 1) before page-level changes
4. **Dark mode always** — Every change must work in both light and dark themes
5. **Mobile-first** — Design for mobile, enhance for desktop
6. **No breaking changes** — Preserve all functionality, only change appearance
7. **Consistent patterns** — Use the same card style, spacing, and hover effects everywhere
8. **21st.dev as reference** — Use their components as inspiration for layout/patterns, adapt to our design tokens
9. **Accessibility** — Maintain WCAG AA contrast, focus states, screen reader support
10. **Performance** — No heavy animations, lazy-load images, minimize CSS bundle
11. **Rich backgrounds** — Never plain mono-color backgrounds; use mesh gradients, dot patterns, gradient overlays

---

## Verification

After each phase:
1. Run `pnpm dev` and visually check all modified pages
2. Test light and dark mode toggling
3. Test responsive: mobile (375px), tablet (768px), desktop (1440px)
4. Check keyboard navigation (Tab, Enter, Escape)
5. Verify no console errors or warnings
6. Run `pnpm build` to ensure no build errors
