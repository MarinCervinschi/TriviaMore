# TriviaMore — Design System

The system as it stands, for whoever is about to write UI here.

**Where truth lives.** [`DESIGN_DECISIONS.md`](./DESIGN_DECISIONS.md) holds the decisions and the
reasoning — D1–D26, each ending in a *Rules out* line. This file says what the system **is**; that one
says **why**, and wins wherever the two disagree. `src/styles/globals.css` holds the **values**.

**This file does not restate a number that lives in `globals.css`.** That is deliberate, and it is the
lesson of the version this replaced: it copied token values, the values moved, and the copy stayed. It
ended up asserting a radius ladder that was wrong on three rows of six, a card elevation that described
the minority of surfaces, six utility classes of which four had been deleted, and — worst — a section
headed *"Semantic (use directly, not via tokens)"* over raw palette classes, which is the exact thing
D26 removes. A doc that is out of date gets ignored; one that instructs confidently and wrongly gets
followed. So: this file names the token and says what it is **for**. Read the value from the CSS.

---

## The brief

**Refine the existing language; do not replace it** (D1). The app keeps its visual identity, and the
work happens at the level of typography, colour discipline, spacing and surface consistency. Three
wholesale redesigns were prototyped and rejected as unjudgeable — moving paper, typeface and structure
at once leaves nothing to compare.

Two working rules came out of that and still hold:

- **Change one variable at a time**, shown on the app's real components, in both themes.
- **Prototype in Storybook → the user looks → decide → delete the lab.** Nothing visible reaches the
  app before someone has looked at it. Six labs were built and deleted this way.

**Light first** (D2). A colour or contrast choice that only works in dark is not a choice, because
light is the harsher case and the one most people use.

**Neumorphism is rejected, not deferred** (D8). Its form comes from a light and a dark shadow on a
mid-lightness surface — that is, from contrast — so the contrast problem is the mechanism, not a side
effect to design around. There is no hybrid to fall back to.

The product this has to serve is a study CRM: dense pages, long text, a lot of numbers. That is a
constraint on style, not a detail — anything that only survives on a marketing page is wrong here.

---

## Vocabulary

One Italian word per level of the catalog (D21). The data model is English; the interface is Italian.

| Entity | Interface | Never |
|--------|-----------|-------|
| `departments` | dipartimento | |
| `courses` | corso *(corso di laurea where there is room)* | |
| `classes` | **insegnamento** | ~~corso~~, ~~classe~~ |
| `sections` | sezione | |
| `questions` | domanda | |

`corso` naming a `class` is the mistake to watch for: it collides with the level directly above it and
took ~26 call sites to undo. Never abbreviate an entity to fit a control — resize the label.

Copy is specific and spelled properly (D7): accents included, sentence case, and a dialog title names
the object and the act rather than asking "Sei sicuro?".

---

## Colour

Four families, four jobs. Mixing them is the failure mode — a colour that means two things means
neither.

| Family | Job |
|---|---|
| `--primary` / `--brand` | the brand, and the primary action — **one** ramp, used as an accent (D14) |
| `--success` `--warning` `--info` `--destructive` / `--danger` | **status** — an outcome |
| `--chart-1…5` + `--chart-N-ink` | **identity** — a chart series, a category |
| `--heat-1…5` | **magnitude** — one hue, monotone lightness |

Plus the decorative card tint of D4, which sits deliberately outside that list and **must never be
readable as meaning**.

### Surface and ink are two values, not one

**A colour's surface value is not its ink value** (D19). A value tuned as a fill is too dark to read as
text on a near-black page, and one token cannot be both. So the split is systematic:

| | surface (`bg-*`) | ink (`text-*`) |
|---|---|---|
| brand | `--primary` | `--brand` |
| error | `--destructive` | `--danger` |
| identity | `--chart-N` | `--chart-N-ink` |

The status tokens carry the split inside themselves — their dark values are lifted for text, and they
are used both ways. `--primary` is theme-constant on purpose; `--brand` is what changes.

**Never `text-primary`.** It measures 3.52:1 on the dark surface. Use `text-brand`.

### The rules

- **Colour never carries meaning on its own** (WCAG 1.4.1): always with text, shape or position.
- **Status is an outcome; category is an identity.** A course type is not a success. Painting one
  green says it went well (D26).
- **Never a raw Tailwind palette class** — `text-green-600`, `bg-blue-500/10`. Every one of them is a
  value outside the system that cannot respond to the theme. 433 of them were counted in August; the
  ones that remain are tracked on #118 and owned by the issue that will rewrite their page.
- **Tune against `bg-muted`, not the page.** Muted is the binding surface — the gate measures the status
  and category inks on it, and its own lightness is pinned there (D28) — and it is harsher than the
  tinted canvas, so a colour tuned to 4.5 on the page fails the moment it lands on a tab, the admin
  sidebar or a stat block.
- **Measure against the real foreground token, not white.** `--destructive-foreground` is not `#fff`,
  and that difference once hid a failing 4.33 behind a passing 4.53.
- **Never propose lifting or recolouring a *surface* (`--card`/`--popover`), accent or neutral-as-fill.**
  Reversed three times (D25): twice on `--primary` and `--destructive`, where a lighter hue reads washed
  out as a large fill and vivid as text — that asymmetry is why the ink split exists — and once on the
  neutrals. D28 later revisited the flat look by moving the **canvas** (`--background`) instead, keeping
  the card; canvas ≠ surface is the system now, but the bar on touching the card stands.

### The categorical ramp has an ordering constraint

Five slots, assigned in slot order and never cycled. Green sits between blue and violet because
**blue↔violet is the pair that collapses under colour-vision deficiency** (ΔE 3.0 under deuteranopia),
so slots 2 and 4 are kept non-adjacent — a chart legend never puts them side by side.

That mitigation does not transfer to an unordered set. **Anything needing all five slots at once
necessarily includes the collapsing pair**, and then colour cannot be the only channel. Department
areas do exactly that, and hold because each renders its own icon.

### Contrast is a gate, not a review step

`src/styles/contrast.test.ts` parses the tokens out of `globals.css` and asserts every pair the app
renders, in both themes. `pnpm test` fails on a regression. Adding a colour to the system means adding
its row. A pair that genuinely needs less than 4.5:1 is added with the floor it does need **and a
reason**; a row is never deleted to make the suite pass.

---

## Type

DM Sans for the interface, DM Serif Display for display, DM Mono for code (D3, D16, D17).

- **`font-display`** is L2 display headings only — the landing hero and section opener, the about and
  contact heroes. It ships at one weight, so it can never combine with `font-bold`.
- **`font-mono` is for code and identifiers, not figures.** A proportional face with `tabular-nums`
  already aligns columns, and the mono face made numbers a different voice from the text around them.
- **`text-2xs` is the floor** — one step below `text-xs`. Below that a label is past legibility, so
  there is nothing left to spend.
- **A `text-[Npx]` anywhere is a leak.** There are none in `src`; 61 were collapsed to get there.
- **The overline is the `eyebrow` / `eyebrow-lg` utility**, never a hand-rolled
  `text-xs uppercase tracking-…` string. ~50 spellings collapsed onto two.
- **A pill is not an overline.** A class string carrying a background or a border is `Badge`'s job.

---

## Radius

Five steps, 4px apart, **all derived from `--radius`** — so that token is the one knob, and moving it
moves the whole scale (D24).

| Step | Role |
|---|---|
| `rounded-sm` | checkbox, chart cell |
| `rounded-lg` | a control inside a control; a menu item |
| `rounded-xl` | button, input, select — `--radius` itself |
| `rounded-2xl` | card, dialog, toast |
| `rounded-3xl` | page-level panel — `<Card level="panel">` |
| `rounded-full` | badge, avatar, pill |

**`rounded-md` is not a step.** It is pinned to `lg` only so that reaching for it out of shadcn habit
cannot land on Tailwind's off-scale default. Use `rounded-lg`.

### A child in its parent's corner steps down one

For a child inset by padding `P` inside a parent of radius `R`, the child wants `R − P`: the arcs then
share a centre and the gap stays even around the curve. A child at or above its parent's radius pushes
out of the corner and the gap swells exactly there.

**The steps are 4px apart because the app's tight paddings are 4/6/8px** (`p-1`, `p-1.5`, `p-2`), so
`R − P` lands on another step instead of between two. A `rounded-2xl p-1` panel takes `rounded-xl`
items; a `rounded-xl p-1` panel takes `rounded-lg` items.

**This applies only while the child's corner is in the parent's corner — roughly `p-2` and under.** At
`p-4` the child is 16px from the parent's arc, the curves are not adjacent, and the child takes the
radius of its own role. Applied without that bound, the check flags almost everything: that was the
first audit's mistake, 58 of 64 pairs.

---

## Surfaces and elevation

**A card is elevated in light** (D25). `<Card>` carries `shadow-xs` + `border-border/50` — softened for
D28, since the canvas now separates it by tone and the shadow only confirms it; a hand-rolled flat
`bg-card border rounded-2xl` is still a deviation. In dark the shadow does little and the border carries
it — see below.

`<Card>` also owns three things worth not re-inventing:

- **`level="panel"`** — the page-level surface, one radius step up. Radius only: **padding stays with
  the caller**, because the sites that want this tier use three different paddings.
- **`CardTexture`** — D27/D28's opt-in pixel field: a tiled grid of tiny squares, monochrome on
  `--foreground`, placed *on* the content by `placement` (the page already wears the dot band, so the
  card takes a different mark). Its **parent needs `relative overflow-hidden`**; opacity is the
  `--card-pixel-alpha` token, lowered per-card via `alpha` on a rich card. The orb is retired.
- **`transition-shadow`, not `transition-all`.** At rest the shadow is the only property that changes,
  and `transition-all` animates layout properties on every card in the app.

### The canvas is a tone below the surfaces (D28)

`--card` / `--popover` and `--background` are **no longer one value** — in both themes the card keeps its
tone and the canvas is nudged to another, so a surface separates by tone as well as by its shadow (light)
and border (dark). In dark the card stays the saturated blue-black and the canvas is lifted a step; in
light the surfaces carry a cool tint and the canvas a cooler grey.

**What D25 still forbids is lifting or recolouring the *card*.** D28 moved the *canvas*, which was never
the objection — the card the user chose is untouched. A lightness ladder *on the surfaces* was built,
measured (ΔL* 3.5, contrast holding) and rejected three times on the look; do not re-propose that.

**Still use `bg-popover` for anything that floats**, not `bg-background` — now that they differ this is
load-bearing, not just a name.

**Read surface adjacency in ΔL\*, not as a contrast ratio**, whenever it does come up. A lifted dark card
measures 1.07 as a ratio — nothing — and 3.5 in ΔL*. A luminance ratio answers *"can text be read on
this"*, never *"can two large adjacent surfaces be told apart"*.

### Elevation vocabulary

| | |
|---|---|
| at rest | `shadow-xs` (Card, softened for D28) |
| hover, when the thing is interactive | `shadow-md` |
| floating — dialog, dropdown, popover, toast | `shadow-lg` |
| focus | `shadow-focus`, the token — never an inline value (D22) |
| a status halo | `shadow-halo-success` / `-info` / `-warning` |

A hover shadow is an affordance: **a hover affordance means the thing is interactive** (D5), so it
never appears on something inert.

---

## Background

One texture, `<PageBand />`, mounted **once** in the `_app` shell so it spans the sidebar gutter
(D12, D13). Dots plus one soft orb, both fading vertically, anchored **top left**.

- **`level` follows `isAuthenticated`.** `"public"` is the same band with its two alphas turned up —
  not a second system.
- **Everything below the band is flat by construction.** No per-surface opt-out, no measuring — with
  one bounded exception: a card may opt into `CardTexture` (D27/D28), a pixel field *on* its content,
  faded by placement; a content-rich card lowers its `alpha` rather than dropping it.
- **Anything sitting over the band must be opaque.** A translucent surface is tinted by whatever
  passes behind it — invisible on a flat page, obvious over decoration. This is the bug to remember
  when a control looks wrong: `Input`, `Textarea` and `SelectTrigger` shipped `bg-transparent` from
  shadcn, and nine chrome bars sat at 70%.
- **The six surfaces genuinely outside `_app`** — auth, quiz, flashcard, the quiz skeleton, error and
  not-found — mount their own band.
- Card-level decoration (D4) is card-scale and never fights the page's single light — the blurred
  `CardOrb` is retired for `CardTexture` (D27); the tints stay.

The diagonal beams are **parked, not rejected** (D18). If they come back, read D18 first: one angle
cannot serve both the band axis and the travel axis, and a vertical mask over a diagonal eats the part
that makes it a beam.

---

## Motion

Framer Motion is the **only** motion dependency. AutoAnimate was decided and then reversed (D9): the
list transitions it would serve are few, and a second animation library for them is not worth the
dependency. Animate UI was rejected as a component system for the same reason (D10) — its patterns are
worth reading, its components are not worth adopting wholesale.

Variants live in `src/lib/motion.ts` — `springGentle`, `springSnappy`, `easeFade`; `fadeInUp`,
`fadeIn`, `scaleIn`, `slideInLeft`, `slideInRight`, `staggerContainer`, `staggerItem`. Use them; do not
write inline variants.

### The reduced-motion trap

The `prefers-reduced-motion` block in `globals.css` zeroes CSS `animation-duration` and
`transition-duration` — **CSS only**. Framer Motion animates by writing inline styles and does not
honour the query at all. So:

- **Framer** needs `useReducedMotion()` + `withReducedMotion()`, every time.
- **A CSS transition** needs `motion-reduce:transition-none`.

### What earns motion

Motion is spent on **state the user caused**, and it is the first thing the eye catches — before
contrast, before colour, before shape. Doherty's threshold, ~400ms, is the ceiling for a response that
should feel immediate; press feedback is ~200ms.

**Icon motion is a CSS crossfade, not Framer** (D23) — two overlaid icons, `transition-transform` plus
`scale-0`/`scale-100`, with `motion-reduce:transition-none`. Six lines, no dependency, no guard to
remember. And it only earns its place when the two drawings **read as different**: animating a swap
between near-identical drawings advertises that they are near-identical.

---

## Icons

**Solar, Linear style** (D11), imported per icon by path: `@solar-icons/react/linear/<icon>`. The
mapping from the old Lucide names, and the reasoning for the re-cut substitutions, is in
[`ICON_MAP.md`](./ICON_MAP.md).

- **Never pass `strokeWidth` to a Solar icon.** 1.5 is the package default; the 82 that existed were
  all fighting Lucide's 2. It stays legitimate on a hand-drawn SVG — the logo, the clock face, the
  third-party tech logos — and as a Recharts prop.
- Sizes: `size-4` inline, `size-5` in a button, `size-8`+ decorative.
- **`src/components/icons/`** holds only what Solar does not carry: the glyphs (✕ ＋ − ✓ ●, built on
  Solar's own `IconBase`), the GitHub mark, and the spinner. `Icon` is the shared type.
- **Verify the drawing, not the name.** Solar's `filters` is three overlapping circles — the
  *photographic* filter. Decode the base64 preview in the icon's `.d.mts` when a name is not
  conclusive.
- CC BY 4.0 attribution ships with the icons: the landing footer **and** the about page, because the
  footer only renders for unauthenticated users.

---

## Components

Reach for the primitive before writing the recipe.

| Job | Component | Note |
|---|---|---|
| any table | `src/components/data-table/` | The one table. TanStack Table **v9** — v8 snippets do not transfer. Use the `data-tables` skill |
| a surface | `Card`, `Card level="panel"`, `CardTexture` | see Surfaces |
| nothing to show | `EmptyState` | `InlineEmpty` for the one-line case inside a table or chart |
| state on a row | `Badge` | **state, not attributes** (D6). `size="sm"` for the dense case |
| an action | `Button` | `asChild` to wrap a `<Link>`; the parent's `aria-label` reaches the child through Radix `Slot` |
| a message | `toast` via `src/lib/toast.ts` | `toastUndo` for anything reversible |
| a mutation | `useMutationWithToast` | takes an `undo` option; declaring it makes the success toast undoable |
| loading | `Spinner` from `@/components/icons` | inline, 11 call sites. It carries `role="status"` and an sr-only label |
| a whole page loading | `LoadingPage` | the only consumer of `ui/loading-spinner` — do not reach for that one directly |
| a placeholder | `Skeleton` | uses `shimmer`, never `animate-pulse` |
| a row's actions | `AdminRowActions` | takes `label` so a table reads "Modifica Analisi matematica I", not twenty identical "Modifica" |

### Confirmation or undo, decided by reversibility

**Undo for the frequent and reversible; confirmation for the rare and irreversible** (D20). A dialog
shown often becomes background noise and stops being read — its power is its rarity. The role change
deliberately keeps its dialog despite being reversible, because undoing a promotion still leaves a
window of granted privilege.

No dialog says "Sei sicuro?". It names the object and the act.

### Skeletons mirror their page

When a route has a `pendingComponent`, its skeleton in `src/components/skeletons/` changes with the
page. A skeleton that drifts is worse than none: it makes the swap jump.

### The `container` trap

`container` is an `@utility`, not a plain `.container` rule — and it has to be. **A plain rule is
unlayered, and unlayered author styles beat layered ones regardless of order**, so `container max-w-3xl`
silently failed to narrow at five call sites. Anything that must be overridable by a Tailwind utility
belongs in a layer.

### What `globals.css` still owns

After D15 removed what nothing referenced:

`gradient-bg` / `gradient-text` (the brand ramp, as background and as text fill), `shimmer`, `fade-in`,
the `flashcard` 3D flip trio, `band-dots` / `band-glow` (used only by `PageBand`), `eyebrow` /
`eyebrow-lg`, and `container`. **It holds no hardcoded hex** — the scrollbar was the last one.

---

## The accessibility floor — WCAG 2.2 AA

- Text **4.5:1**; large text and UI components **3:1**. Checked in light first, and by the gate.
- **Every control has an accessible name** (4.1.2) — an icon alone is not a name, and **a tooltip is
  not a name**: Radix `Tooltip` sets `aria-describedby`. A description supplements a name; it does not
  supply one.
- **Name the object, not the action.**
- Every target at least **24×24** with spacing (2.5.8). The `@media (pointer: coarse)` 44px rule in
  `globals.css` is an enhancement and **does not discharge this**, which applies to every pointer.
- Focus is **visible** (2.4.7) and **not obscured** (2.4.11).
- Decorative elements get `aria-hidden` and `pointer-events-none`.
- UI text is Italian; code comments are English.

---

## Where things live

```
src/components/ui/           the primitives — every one has a story
src/components/data-table/   the one table
src/components/icons/        only what Solar does not carry
src/components/layout/       navbar, sidebar, footer, PageBand
src/components/skeletons/    one per route with a pendingComponent
src/components/shared/       cross-area components
src/components/charts/       Recharts 3 — cannot be verified in jsdom
src/hooks/                   useReducedMotion, useScrollReveal, useTheme, useAuth…
src/lib/motion.ts            the Framer variants
src/lib/toast.ts             toast + toastUndo
src/styles/globals.css       every token, and the contrast gate beside it
```

---

## Verification

`pnpm exec tsc --noEmit`, `pnpm test`, and the build. A UI change also has to pass
`pnpm build-storybook`, which proves a story **compiles** — not that it renders.

**Browser verification is the user's.** A green build never proves appearance. And **look at both
themes**: dark is where token mistakes surface, which is how the grade colours, the chart palette and
an entire missing elevation ladder all survived review.
