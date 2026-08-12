---
name: design-system
description: The rules and the traps of the TriviaMore UI — the token families and their jobs, surface vs ink, the radius and elevation ladders, the background band, motion and reduced motion, and the mistakes that cost a session each. Use whenever writing or changing UI: a component, a colour, a radius, a shadow, a background, an animation, or anything under src/components/ or src/styles/.
---

# Design system

Two files hold this system and neither is this one:

| | |
|---|---|
| `docs/DESIGN_DECISIONS.md` | the decisions, D1–D26, each ending in a **Rules out** line. **The source of truth.** Read the relevant `D*` before proposing a change to what it settled |
| `docs/DESIGN_SYSTEM.md` | the system as it stands: which token, for what |
| `src/styles/globals.css` | the values. Read them here, never from a doc |

This skill is the short version: the rules that constrain a choice, and the traps that have each cost
a session. It carries **no token values** on purpose — a copied value is how the previous design doc
came to assert a radius ladder wrong on three rows of six.

## The brief, and the one that was reversed

**Refine the existing language; do not replace it** (D1). Typography, colour discipline, spacing,
surface consistency — not new layouts. Three wholesale redesigns were prototyped and rejected.

Older notes said *"bold, not incremental"* and pointed at `ui-ux-pro-max` and 21st.dev for
inspiration. **That is reversed.** It is the path that produced the rejected redesigns.

Two working rules:

- **One variable at a time**, on the app's real components, in both themes.
- **Prototype in Storybook → the user looks → decide → delete the lab.** Nothing visible lands before
  someone has looked. **Browser verification is the user's** — a green build never proves appearance.

## Before changing anything visible

**Verify the claim, not the intention.** Five queue items this August were described wrongly, and in
every case measuring first changed the work:

- *"two container systems"* → one container plus a cascade-layer bug
- *"~30 hand-rolled card recipes"* → 69 surfaces, and two different looks
- *"the radius ladder is fine"* → two class names rendering the same value across 433 uses
- *"D15 is done"* → four dead classes and six hex values still in the file
- *"migrate the colour maps onto the status tokens"* → those maps encode category, not status

Count it, then work. A grep with a number in it is worth more than a paragraph of intent.

## Colour

Four families, four jobs — mixing them is the failure mode:

- `--primary` / `--brand` — brand and primary action
- `--success` `--warning` `--info` `--destructive` / `--danger` — **status**, an outcome
- `--chart-1…5` + `--chart-N-ink` — **identity**, a series or a category
- `--heat-1…5` — **magnitude**

Plus D4's decorative card tint, which sits outside that list and **must never read as meaning**.

**Surface and ink are two values** (D19). A value tuned as a fill is too dark to read as text on a
near-black page, and one token cannot be both: `bg-primary` / `text-brand`, `bg-destructive` /
`text-danger`, `bg-chart-N` / `text-chart-N-ink`. **Never `text-primary`** — 3.52:1 on the dark surface.

Rules that decide a colour question:

- **Status is an outcome; category is an identity.** A course type is not a success (D26).
- **Never a raw Tailwind palette class.** It cannot respond to the theme.
- **Tune against `bg-muted`, not the page** — 4% off white, ~0.4 of a ratio point, and five tokens were
  re-cut after a pass that looked clean.
- **Measure against the real foreground token, not white.**
- **Never propose lifting a dark *surface*, accent or neutral.** Reversed three times. On accents a
  lighter hue reads washed out as a fill and vivid as text, which is why the ink split exists; on the
  neutrals the measurement was fine and the look still lost (D25).
- **Contrast is a gate**: `src/styles/contrast.test.ts`. Adding a colour means adding its row. A pair
  needing less than 4.5:1 gets the floor it needs **and a reason**; a row is never deleted to pass.
- **`--chart-*` slots 2 and 4 collapse under CVD** and are kept non-adjacent. Anything needing all five
  slots at once includes that pair, so colour cannot be its only channel — give it an icon.

## Radius

Five steps 4px apart, all derived from `--radius`. `rounded-md` is **not a step** — pinned to `lg` so
shadcn habit cannot reach Tailwind's off-scale default.

**A child in its parent's corner steps down one**: for padding `P` inside radius `R` the child wants
`R − P`, so the arcs share a centre. The steps are 4px apart *because* the tight paddings are 4/6/8px,
so `R − P` lands on another step. **Only while the corners are adjacent — `p-2` and under.** Past `p-4`
the child is a separate shape; applying the rule there flags almost everything.

## Surfaces

**A card is elevated in light.** A hand-rolled flat `bg-card border rounded-2xl` is a deviation there,
not a variant.
`<Card>` owns `level="panel"` (page-level tier, radius only — padding stays with the caller) and
`CardOrb` (D4's decoration; **its parent needs `relative overflow-hidden`**).

**In dark the surfaces are flat.** `--card`, `--popover` and `--background` are the same value, and a
surface is separated by its **border**. A lightness ladder was built, measured and **rejected on the
look** — the third time a lifted dark surface has been. **Never re-propose it**, neutral or not: the
numbers were fine and the answer was still no (D25).

**Still use `bg-popover` for anything that floats**, not `bg-background`. It renders identically today
and names the role, so the question has one value to move if it reopens.

**Read surface adjacency in ΔL\*, not as a contrast ratio.** A ratio answers *"can text be read on
this"*. A lifted dark card measures 1.07 as a ratio — nothing — and 3.5 in ΔL* — clear.

## Background

One band, `<PageBand />`, mounted **once** in the `_app` shell. Everything below it is flat by
construction.

- **Anything over the band must be opaque.** A translucent surface is tinted by what passes behind it —
  invisible on a flat page, obvious over decoration. `Input`, `Textarea` and `SelectTrigger` shipped
  `bg-transparent` from shadcn. **This is the first thing to check when a control looks wrong.**
- Six surfaces sit genuinely outside `_app` (auth, quiz, flashcard, quiz skeleton, error, not-found)
  and mount their own band.
- The band belongs in the **shell**, not in page headers: they sit at different nesting depths, so none
  of them can reach across the sidebar's 90px gutter — and that gutter is where the seam appears.

## Motion

Framer Motion is the only motion dependency (D9 reversed AutoAnimate).

**The reduced-motion trap.** The `globals.css` block zeroes CSS durations — **CSS only**. Framer writes
inline styles and ignores the query:

- **Framer** → `useReducedMotion()` + `withReducedMotion()`, every time
- **a CSS transition** → `motion-reduce:transition-none`

Motion is spent on **state the user caused**. ~200ms for press feedback, ~400ms ceiling (Doherty).
**Icon motion is a CSS crossfade, not Framer** (D23), and only when the two drawings read as different
— animating a swap between near-identical icons advertises that they are near-identical.

Use the variants in `src/lib/motion.ts`; do not write inline ones.

## Traps that `tsc` cannot catch

- **An unlayered rule beats a layered one, regardless of order.** `container` must be an `@utility`; as
  a plain `.container` rule it silently defeated `max-w-3xl` at five call sites.
- **A custom `@keyframes` named like a Tailwind one shadows it.** A local `pulse` was quietly serving
  every `animate-pulse` in the app.
- **A tooltip is not an accessible name.** Radix `Tooltip` sets `aria-describedby`.
- **A name can arrive from another file.** Radix `Slot` merges parent props onto the child, so
  `<Button asChild aria-label>` names the `<Link>` inside. A static audit cannot see that.
- **`Card` has no `asChild`** — a `<Link>` or a `motion.li` styled as a card cannot be converted.
- **The 44px `pointer: coarse` rule does not discharge WCAG 2.5.8**, which applies to every pointer.
- **Recharts cannot be verified in jsdom.** `ResponsiveContainer` measures 0×0 and draws nothing.
- **`pnpm build-storybook` proves a story compiles, not that it renders.**

## Where the primitives are

`src/components/ui/` for primitives, `src/components/data-table/` for **every** table (TanStack Table
**v9** — use the `data-tables` skill), `src/components/icons/` for what Solar does not carry.

Reach for `EmptyState` / `InlineEmpty`, `Badge` (state, not attributes — D6), `Card`, `Spinner`,
`toastUndo`, `useMutationWithToast` before writing the recipe by hand. **Undo for the frequent and
reversible; a confirmation only for the rare and irreversible** (D20) — a dialog shown often stops
being read.

Every `ui/` primitive has a story, and so does every shared component — use the `storybook` skill.

## Verification

```
pnpm exec tsc --noEmit
pnpm test                 # includes the contrast gate
pnpm build-storybook      # any UI change
```

Then hand it to the user, and say what you did **not** verify. **Look at both themes**: dark is where
token mistakes surface, and it is how the grade colours, the chart palette and a missing elevation
ladder all survived review.
