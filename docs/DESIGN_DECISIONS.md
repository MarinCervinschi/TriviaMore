# TriviaMore — Design Decisions

> The running log of **decisions**, not of rules. Each entry records what was chosen, why, and
> what it rules out, so a choice is not relitigated every time someone looks at the UI.
>
> `DESIGN_SYSTEM.md` describes the system **as it is today**. This file is what the next version
> of it gets built from — where the two disagree, this file is newer and wins.
>
> Tracked by #145 (design system), under the restyle epic #127.

---

## D1 — Refine the existing language, do not replace it

**Decided 2026-08-09.** The app keeps its current visual identity: soft lines, the current radii,
the existing palette, the brand orange, the dot grid, the blurred orbs. Work happens at the level
of typography and detail.

Three wholesale directions were prototyped in Storybook and rejected on sight — an
editorial/paper skin, a brutalist-structural one, and a restrained-depth one. The foundation was
not the problem; the generic detailing on top of it was.

> ⚠️ This reverses the "Bold, not incremental" philosophy still written at the top of
> `DESIGN_SYSTEM.md`. That section is now wrong and must be rewritten when the system is updated.

**Rules out:** new layout systems, new surface systems, wholesale skins, and neumorphism —
see D8.

---

## D2 — Light-first

**Decided 2026-08-09.** The light theme is the one the app is designed for. Dark mode stays fully
supported, but it is judged second, and no decision is taken to serve it at the expense of light.

**Why:** studying happens in bright ambient light, where a light interface is more legible and
tires the eye more slowly. This is a use-case argument, not a taste one.

**How to apply:** review every change in light first. A colour or contrast choice that only works
in dark is a bug, not a trade-off.

---

## D3 — Typography: DM Sans for the interface, DM Serif Display for display

**Decided 2026-08-09.** Replaces Poppins as the single family.

| Role | Face | Where |
|------|------|-------|
| Display | **DM Serif Display** (400) | Large headings on the public pages — hero, section openers |
| Interface & body | **DM Sans** (400/500/600/700) | Everything else: UI, body copy, labels, figures |

**Why DM Sans over Poppins:** Poppins is geometric with a low x-height relative to its width,
which is why it reads well as a large heading and poorly at 14–16px — and the app is about to
gain long-form text (discussions #124, open answers #125). DM Sans keeps the friendly geometry
that gives the app its tone, but holds up at small sizes and gains density.

**Why DM Serif Display as the partner:** it belongs to the same superfamily, drawn to share
proportions and metrics with DM Sans, so there is no x-height or rhythm mismatch — the failure
mode that makes most pairings look accidental.

**The rules that make the pairing work, and without which it should not be adopted:**

- Each face has **one fixed job** and they are never interchangeable. A serif heading in the app
  chrome, or DM Sans on a public hero, breaks the system.
- The serif is **never** used for body copy, and never below display sizes — a display face at
  small sizes is just harder to read.
- Hierarchy inside the interface is made with **weight and size in DM Sans**, not by reaching for
  the serif.

**Not adopted:** a third mono voice for figures. It was on the table and was left out — see the
open question O1, which still needs answering either way.

**DM Serif Display ships one weight, 400** — so `font-display` and `font-bold` cannot be combined:
the browser would synthesise a fake bold, which on a display serif is exactly the accidental look
the pairing was chosen to avoid. Every heading that takes the serif drops `font-bold` for
`font-normal`.

**Status: implemented 2026-08-10.** `--font-sans` is DM Sans and a `--font-display` token carries
the serif; `@fontsource/poppins` is removed. The serif is applied to the four L2 display headings —
the landing hero and section opener, and the about and contact heroes. Deliberately *not* applied:
the auth card titles (below display size), the legal heroes and the news page (L1 per D12), and the
404 numerals — all four want a browser look before they get the serif or stay sans.

---

## D4 — Decorative colour on cards stays

**Decided 2026-08-09, after a reversal.** The per-card colour rotation is deliberate and kept:
`StatCard`'s `colorMap`, the landing feature cards, the about-page values, the dashboard quick
actions, the tinted icon tiles and the per-card orbs.

These were removed on the argument that colour should always carry information, and the result
was rejected: without them the interface reads flat. The argument loses here.

**Where the principle still holds:** data visualisation. The `--chart-*` categorical palette and
the `--heat-*` sequential ramp encode meaning and were validated for colour-vision deficiency —
those must never be treated as decoration, and never swapped for each other.

**Rules out:** proposing again that decorative colour be stripped from cards.

---

## D5 — A hover affordance means the thing is interactive

**Decided 2026-08-09, implemented in `4e23b0f`.** Lift and shadow on hover belong to elements you
can actually click. A plain container that rises under the cursor promises a click that never
happens.

Kept on `department-card`, `legal-related-docs` and the dashboard quick actions, which are links.
Removed from `progress-stats`, `platform-stats`, `content-hierarchy-diagram`, the about-page
values and the landing feature cards.

---

## D6 — Badges carry state, not attributes

**Decided 2026-08-09, implemented in `4e23b0f`.** A badge marks something whose value changes or
matters at a glance: difficulty, request status, role, visibility. Stable attributes — year, CFU,
campus, curriculum — are metadata and read better as a line separated by `·`.

A row of identical pills is the tell that the component is being used as decoration.

**Open:** only the class page has been converted. See O2.

---

## D7 — Copy is specific, and spelled properly

**Decided 2026-08-09, implemented in `fbc3b6f` and `4e23b0f`.**

- Accented characters, always. An apostrophe standing in for an accent (`funzionalita'`, `piu'`,
  a bare `e'` for `è`) is the single most visible sign of text written in a hurry.
- No unverifiable social proof ("unisciti agli studenti che stanno già migliorando…").
- No boilerplate borrowed from products this is not — a free, open-source student project does
  not need to say "nessuna carta di credito richiesta".
- Prefer a claim that is true and checkable about this project over one that would fit any
  product.

---

## D8 — Neumorphism is rejected

**Decided 2026-08-09.** It was carried as a candidate from the start of the UI initiative and is
now closed, on three grounds:

1. **It is contrast.** The form comes from a light and a dark shadow on a mid-lightness surface.
   The dark theme's surface is near-black (`224 71% 4%`), which cannot host a lighter shadow —
   adopting it would mean rebuilding the dark theme and re-validating the chart palette against
   the new surface.
2. **It costs density.** A neumorphic card needs a lot of breathing room to read as volume, and
   the roadmap is calendars, threads and dashboards.
3. **It denies borders**, which are what deep nesting (five catalog levels, nested replies) needs
   in order to stay legible.

---

## D9 — AutoAnimate for list transitions

**Decided 2026-08-09.** Adopt [`@formkit/auto-animate`](https://auto-animate.formkit.com/) for
lists whose contents actually change: notifications, bookmarks, user requests, the option rows in
the question editor, and the faceted filter chips.

**Why this and not our own Framer Motion variants:** add / remove / reorder of list children is
the one animation that is tedious to hand-roll and trivial here — one hook returning a ref. It is
a couple of KB gzipped and it reads `prefers-reduced-motion` itself, unlike Framer Motion (see
the trap below).

**Caveats to respect:** it only animates *immediate* children; it sets `position: relative` on the
parent; and it fights `flex-grow: 1` children. On the `DataTable` it would animate row reordering
on sort, which is desirable, but a paginated table replaces every row at once — try that surface
last, not first.

**Status: decided, not yet implemented.**

---

## D10 — Animate UI: not as a component system

**Decided 2026-08-09.** [Animate UI](https://animate-ui.com/docs) is not adopted as a component
library. Its registry declares `@base-ui-components/react`, `@headlessui/react` **and** `radix-ui`
across its items — three primitive foundations in parallel with the Radix/shadcn one we already
have, immediately after a phase spent removing exactly that kind of duplication (#120). It stays
useful as a catalogue of *techniques* to read and reimplement on our own primitives.

**A fact worth keeping:** Animate UI declares `motion` as a dependency, and `motion/react` is
literally `export * from "framer-motion"` (`motion@13` depends on `framer-motion@^13`). Anything
copied from that registry can have its import rewritten to `framer-motion` — no new dependency,
and no risk of shipping two majors of the same engine.

**The animated icons are parked, not rejected** — see O4.

---

## D11 — Icon family: Solar, Linear style

**Decided 2026-08-09.** Solar replaces Lucide. Chosen from a Storybook comparison of Lucide,
Phosphor and Solar on the same 31 concepts and the same screens (`Style Lab/Icone`), matched for
optical weight rather than for each library's defaults.

**Why:** its line is softer and less strictly geometric than Lucide's, which is what makes it fit
the app's own tone. Phosphor is the more *flexible* library — six weights against Solar's six
styles, and far friendlier naming — but flexibility was not the thing being optimised for here;
fit was.

| | |
|---|---|
| UI style | **Linear**, at `strokeWidth={1.5}` — matches the stroke weight the app already uses |
| Expressive style | **BoldDuotone**, available for the feature moments where colour is already decorative per D4 |
| Import | `@solar-icons/react/linear` for the barrel, `@solar-icons/react/linear/<icon>` per icon |

**⚠️ Attribution is required.** The npm package is MIT, but the icon artwork is the *Solar Icons
Set* by **480 Design**, licensed **CC BY 4.0** (see `LICENSE-THIRD-PARTY` in the package).
Commercial use is allowed, attribution is not optional: a visible credit — footer, about page, or
a credits section — has to ship **with** the icons, not after.

**What the migration actually costs**, beyond swapping imports:

- Solar's names are not guessable and have no relation to Lucide's: graduation is `Diploma`,
  trophy is `CupFirst`, search is `Magnifier`, the chevron is `AltArrowRight`, the dashboard is
  `Widget2`, the map pin is `PointOnMap`, delete is `TrashBinMinimalistic`. A **mapping table for
  all 115 icons** has to be built once, by hand, and each substitution looked at — the same word
  does not mean the same drawing.
- Every icon component is suffixed `…Icon` (`BookIcon`, `BellIcon`), which will read oddly beside
  our current naming.
- The style is selected **by import path**, not by a prop — so switching a single icon to duotone
  means changing its import, not passing a flag.
- The `LucideIcon` type is used in **48 places across 22 files** as a component prop type and has
  to be replaced with Solar's `IconProps`-based type. This is the part that touches the design
  system rather than the call sites.

**Do it in the same sweep as D3.** Fonts and icons are both global visual changes needing one
browser pass over every page; splitting them doubles the verification for no benefit.

**The mapping table now exists at `docs/ICON_MAP.md`**, verified name by name against
`@solar-icons/react@2.0.0`. Three things it found that this decision had not anticipated:

- **`strokeWidth` already defaults to 1.5.** The prop this entry asks for goes on no call site, and
  every `strokeWidth={2}` written to fight Lucide's default is deleted rather than translated.
- **Solar has no bare glyphs.** ✕, ＋, −, ✓ and ● exist only wrapped in a circle or a square, and 30
  of our call sites — most of them inside `ui/` primitives — need them unwrapped. They are interface
  punctuation, not iconography, and are drawn from Solar's own paths lifted out of the circled
  variants, so the hand and the weight stay identical.
- **Solar carries no brand marks and no spinner.** `Github` becomes our own glyph; `Loader2` becomes
  a `Spinner` primitive, which is what it should have been — a spinner is motion, and it can then
  carry `role="status"` instead of being an `aria-hidden` icon that happens to spin.

**Status: decided, mapped, not yet applied.** 17 substitutions are flagged in `ICON_MAP.md` as
needing a look before the sweep is committed.

---

## D12 — Backgrounds: dots with a vertical falloff

**Decided 2026-08-09.** Chosen from five treatments compared on a dense page and a sparse one
(`Style Lab/Sfondi`).

The governing principle: **background intensity is a function of content density, not a
constant.** A dot grid behind a calendar grid (#129) or a thread list (#136) is two grids
competing; the texture has to be gone before the content gets dense.

Three levels, which is also the answer to cross-page consistency:

| Level | Where | Treatment |
|-------|-------|-----------|
| **L0 — surface** | Tables, calendar, threads, forms | Nothing. Flat. |
| **L1 — app page** | Every logged-in page | Dots with a vertical falloff — present at the top, gone by ~64% of the page — plus one anchored glow |
| **L2 — public** | Home, about, contact, auth | The full treatment: stronger dots, brand wash, orbs. These pages are sparse and want personality. |

**The dots themselves:** ~13% of `--foreground` at a 22px pitch in light, ~16% in dark, masked
with `linear-gradient(to bottom, …)`. The alpha must differ per theme — the same value reads far
weaker as white-on-dark than as near-black-on-white.

**Why not simply darker dots:** at 4% today they sit around 1.1:1 against white, which is why they
are invisible; at 10% they reach roughly 1.25:1 and become legible — but uniformly, including
behind the dense surfaces where they do the most harm. The falloff gets the legibility without
the harm.

**What this replaces:** the dot field is currently applied twice — globally on `body` at 4% and
again through `.dot-pattern` at 6% in 12 places, each modulated by a different `opacity-30/40/50`.
Five intensities of the same texture, several of them weaker on top than underneath.

**Status: decided, not yet implemented.**

---

## D13 — The ambient wash is anchored, and there is one of it

**Decided 2026-08-09.** Chosen as option D of five, compared in a scrolling frame
(`Style Lab/Sfondi → AloneEScorrimento`).

- **Anchored to the page, not the viewport.** `DecorativeBackground` is `fixed inset-0` today, so
  it stays glued to the window while the page moves. With D12 the dots now fade *with the page*,
  and a pinned glow drifts out of step with them — two devices saying the same thing, moving
  apart. The glow scrolls away with the dots.
- **One light source, not two.** The current wash is a primary orb plus a warm orange one in
  opposite corners; two hues in two corners is what makes it read as decoration rather than as
  light. With the dots carrying the texture, the wash only has to say "the page starts here".
- **Intensity ~10% of `--primary`** (~16% in dark), from the option-D/option-E comparison.

⚠️ **The origin is not settled** — see O7. The lab put it at the top left; the per-component orbs
run 11 top-right to 4 top-left. Whichever direction wins applies to this too.

---

## D14 — One brand ramp, used as an accent

**Decided 2026-08-09.** `--gradient-from` → `--gradient-to` is the only brand ramp, and it is an
accent rather than an ambience.

Today there are **three incompatible ramps** doing the same job: the tokenised one, an inline
`from-primary … to-red-400` in `quiz-progress.tsx`, and `from-red-500/10 … to-orange-500/10` in
`quiz-timer.tsx`. Those collapse onto the token, and the timer's alert state moves onto a status
token instead of raw `red-500`.

**Where the ramp is allowed** — settled 2026-08-09:

1. **Display text on the public pages (L2)** — seven of the ten current `.gradient-text` sites.
2. **The primary CTA.**
3. **The logo wordmark**, which is the one app-internal exception: it *is* the brand mark, so it
   carries the brand ramp wherever it appears.

**Dropped:** the quiz **question number** (`quiz/question-header.tsx`) — a running counter is
chrome, and spending the brand accent on it is what makes the accent stop meaning anything — and
the **"Ciao, {nome}" greeting** on the dashboard (`routes/_app/user/index.tsx`), for the same
reason: L1 pages carry no brand ramp except the mark itself.

**The progress bar goes flat `--primary`.** This reverses my own earlier proposal to keep a ramp
there. The reason is the allow-list itself: a bar that sits on screen for the whole length of a
quiz is not an accent moment, and a gradient on it encodes nothing that a solid fill does not.

**The quiz timer keeps its single threshold and moves onto `--warning`.** It fires under five
minutes and is currently painted red, so its name says warning and its colour says danger; amber
is what it actually means. Adding a second, more urgent state under a minute would be a behaviour
change, not a styling one — out of scope here, worth considering separately.

---

## D15 — Dead CSS removed

**Decided 2026-08-09.** Four classes in `globals.css` have **zero usages** in the app:
`.quiz-progress`, `.quiz-timer`, `.auth-glass-effect`, `.social-auth-btn`. Verified against `src/`,
`public/` and `docs/` — the only external mentions are in `DESIGN_SYSTEM.md`, which D1 already
flags for a rewrite.

Two of them (`.quiz-timer`, and the scrollbar block that stays) are the last places holding
hardcoded brand hexes — `#d14124`, `#dc2626`, plus six in the scrollbar. **The remaining #118
"brand hex" item is therefore resolved by deletion, not by conversion**, except for the scrollbar,
which stays and goes onto tokens.

**The scrollbar keeps the brand, quietly** — settled 2026-08-09. The thumb is solid `#d14124`
today, which makes it the loudest brand element on a long page, competing with the primary CTA
for attention while being pure chrome. It goes to `hsl(var(--primary) / 0.4)` at rest and full
`--primary` on hover, with the track on `--muted`. The signature survives; the shouting does not.
Both themes come from the same tokens, so the separate `.dark` scrollbar block disappears too.

---

## The rules these decisions serve

**Added 2026-08-09.** The decisions above are choices; these are the constraints they have to
satisfy. Where a decision and a rule collide, the rule wins — a rule is why a choice is right, not
a matter of taste.

### Hierarchy of action

- **One primary action per view.** The Von Restorff effect is why a primary button works: it is
  the only one. A second one halves both.
- **A destructive action never carries the primary's weight.** Red belongs to destruction and
  error, and to nothing else — the moment it decorates, it stops warning.
- **Confirmation or undo, decided by reversibility and frequency.** Confirmation for the rare and
  irreversible (deleting an account, a section with its questions); **undo** for the frequent and
  reversible (removing a bookmark, unfollowing a class). A dialog shown often becomes background
  noise and stops being read — its power is its rarity.
- **A dialog title names the object and the act** — "Elimina la sezione?" — not "Sei sicuro?".

### Hierarchy of colour

- **Colour never carries meaning on its own** (WCAG 1.4.1): always with text, shape or position.
- Each colour has exactly one job: brand orange for brand and the primary action; red for
  destruction and error; the status tokens for status; `--chart-*` for data identity; `--heat-*`
  for magnitude. The decorative card colour of D4 sits deliberately outside that list and must
  never be readable as meaning.
- **Contrast is a gate, not a review step**, and it is checked in light first (D2).

### Order and position

- **Serial position:** people recall the first and last items of a series and lose the middle. What
  matters goes at the ends — in navigation, in a form, in a dashboard.
- **Fitts:** the more frequent the action, the larger it is and the closer to where the pointer or
  thumb already is. On mobile that argues for the bottom, not the top.
- **Hick:** keep the top level short. The sidebar is about to carry study, planner, discussions,
  gamification and admin — that is a grouping problem (#148), not a longer list.
- **Gestalt proximity beats decoration:** spacing groups more reliably than a border does, which is
  the same reasoning that gives dense surfaces no texture in D12.

### Perception, motion and time

- The eye catches **movement first, then contrast, then colour, then shape**. So motion is spent on
  state the user caused (D9), never on ambience — an animated background competes with the content
  for the one channel the eye cannot ignore.
- `prefers-reduced-motion` is not optional, and **Framer Motion does not honour it by itself** —
  see the trap below.
- **Doherty:** under ~400ms reads as instant; past that the interface owes the user a visible
  state. Skeletons cover today's routes. The AI grading of #140 is seconds, not milliseconds, and
  will need a real progress affordance rather than a spinner.

### The accessibility floor — WCAG 2.2 AA

- Text **4.5:1**; large text and UI components **3:1**.
- Every interactive target at least **24×24 px** with spacing (2.5.8). The 44px rule in
  `globals.css` only applies to coarse pointers, so it does not discharge this.
- **Every control has an accessible name** (4.1.2) — an icon alone is not a name.
- Focus is **visible** (2.4.7) and **not obscured** (2.4.11).

### Measured against the app on 2026-08-09

Three failures, computed rather than eyeballed — they are tracked as issues, not fixed here:

| | Measured | Required |
|---|---|---|
|`text-muted-foreground` on `bg-muted`, light|**4.39:1**|4.5:1|
|`text-primary` as text on the dark surface|**3.51:1**|4.5:1|
|Icon-only buttons with an accessible name|**6 of 26**|all|

Tracked as #152 (contrast), #153 (accessible names, and target size with it) and #154 (undo).

The first is systemic: it is the `TabsList`, the admin sidebar and the quiz timer. The second
follows from `--primary` being deliberately theme-constant, so a value tuned for light is too dark
against the dark surface — it passes as a UI component but not as text. Both pass the 3:1 bar for
large text and components, so neither is a crisis; both are below the floor this file just set.

---

## The reduced-motion trap

The `prefers-reduced-motion` block in `globals.css` zeroes `animation-duration` and
`transition-duration`, which covers **CSS animations only**. Framer Motion animates by writing
inline styles from JavaScript and is untouched by it — which is why `useReducedMotion` and
`withReducedMotion` in `src/lib/motion.ts` exist and are used by the 28 files that animate.

Any new JS-driven animation must go through that hook, or it will animate for users who asked not
to see animation. AutoAnimate is the exception: it checks the media query itself.

---

## Open questions

**O1 — `--font-mono` is undefined.** `font-mono` is used in 21 files, mostly for tabular figures,
but the token was never declared — so those figures fall back to whatever monospace the operating
system provides, and change from machine to machine. This needs a decision regardless of D3:
either declare a mono face, or remove the `font-mono` usages and let the figures render in
DM Sans.

**O2 — The badge audit is unfinished.** Roughly 70 badges across 33 files have not been reviewed
against D6. Most look legitimate; the sweep needs a human pass, not a regex.

**O3 — The rest of the system.** Still to decide under #145: the type scale (including the dense
end), surfaces and elevation, the radius scale bound to `--radius`, the shadow tokens that would
replace the duplicated focus ring and CTA glow, and the motion rules. Contrast is a gate on all
of them, checked in light first per D2.

**O4 — ~~The icon set~~ → resolved by D11 (Solar); both leftovers closed on 2026-08-10.** The mapping
table is `docs/ICON_MAP.md`, and the CC BY 4.0 credit ships in the landing footer *and* on the about
page — the footer alone was not enough, since it only renders for unauthenticated users while logged-in
users see the same icons.

**O6 — ~~Gradients~~ → answered by D13, D14 and D15**, except for what O7 and O8 carry.

**O7 — Which direction does the light come from?** The per-component orbs already lean one way:
**11 top-right** (`-top-16 -right-16` ×4, `-top-6 -right-6` ×3, `-top-4 -right-4` ×2, and two
others) against **4 top-left** (`-top-20 -left-20` ×3, `top-0 -left-32` ×1). The outlier is the
page-level wash, which is top-left. Deciding this settles D13's origin too, and the cheap answer
is to move the four rather than the eleven. Kept open because it is a "see it" question: the page
glow and a card orb work at very different scales.

**O8 — ~~The brand ramp's edges~~ → settled inside D14 and D15** on 2026-08-09.

**O5 — Animated icons.** Parked in D10 and unblocked by D11: Animate UI's animated icons are
Lucide-based, so they are now off the table as a source. Either animate a handful of Solar icons
ourselves with Framer Motion — going through `useReducedMotion`, per the trap above — or drop the
idea. Decide only after the D3 + D11 sweep has landed.

---

## Log

| Date | Change |
|------|--------|
| 2026-08-09 | D1–D8 recorded; D3 chosen from a Storybook comparison of six faces and four pairings |
| 2026-08-09 | D9–D10 recorded after evaluating Animate UI and AutoAnimate; icon family opened as O4 |
| 2026-08-09 | D11: Solar chosen over Lucide and Phosphor; O4 resolved, O5 opened |
| 2026-08-09 | D12: dot field with a vertical falloff, and the L0/L1/L2 levels; gradients opened as O6 |
| 2026-08-09 | D13–D15: anchored single-source wash, one brand ramp, dead CSS removed; O6 closed, O7–O8 opened |
| 2026-08-09 | O8 settled: ramp allow-list, flat progress bar, timer on --warning, quiet brand scrollbar |
| 2026-08-09 | Design rules written and measured against the app; three failures filed as #152–#154 |
| 2026-08-10 | D3 implemented; D11 mapped in `docs/ICON_MAP.md`, which adds the glyph, brand-mark and spinner escape hatches |
