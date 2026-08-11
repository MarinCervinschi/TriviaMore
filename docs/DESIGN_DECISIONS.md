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

**Not adopted:** a third mono voice for figures — and D17 later confirmed why: figures want
`tabular-nums`, not a second face. A mono *is* declared, for code and identifiers only.

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

**Status: implemented 2026-08-10, with one change to the mechanism and one count correction.**

**The texture lives in a band at the top of the page, not in a falloff over the page.** This entry
proposed dots fading out by ~64% of the page height. That needs the page's height to be known and the
dense content to happen to fall in the faded part. Instead the dots and the glow live inside the
page-header band, which fades at its own bottom edge — so **L0 is free**: every dense surface sits
below the band and is flat by construction, with no per-surface opt-out and no measuring. It works
because 25 of the L1 routes already open with one of four header components; five more that open
without one got a band directly.

**It was three definitions, not two.** `.chart-plot` was a *third* dot field, at 16px pitch, drawn
**inside every chart** — a dot grid behind gridlines, which is the exact thing this decision's
governing principle forbids, and the densest surface in the app. Deleted.

The seven intensities included one that was subtracting contrast: `.dot-pattern` at `opacity-30`
renders 0.018, **below** the 0.040 the `body` field already laid underneath it. Nobody noticed
because at those values nothing is visible either way.

**Intensity, decided by looking:** `--dot-alpha` is `0.18` light / `0.22` dark and `--beam-alpha`
`0.16` / `0.26`. L2 is the same band with both turned up (`0.24` / `0.30` and `0.24` / `0.38`) —
**not a second system**. Both are tokens, so the whole app re-tunes from two lines. The light itself
is D18's beam; this entry's radial glow is retired.

**A texture repeated per section is decoration, so one band per page.** The mid-page dot fields on
the landing sections, about, contact and browse all went; their surface tints stayed, because a tint
is a surface and not a texture.

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
- **Intensity is `--beam-alpha`, and the shape of the light is D18's beam** — this entry's radial
  corner glow is retired. One lesson survives the swap and is worth keeping: **three attenuations
  compound.** The alpha, the gradient's own `transparent` stop, and the band's mask, which starts
  cutting at 45% of the band's height and throws away the lower half of the light before it reaches
  the eye. When a light reads as barely there, raising the alpha is only one of the three levers, and
  usually not the strongest — widening the source did as much work.

**Status: implemented 2026-08-10. O7 is answered: the light comes from the top left.** The
per-component orbs are explicitly *not* in conflict with it, because they are a different scale — a
card orb is tens of pixels at `-top-16 -right-16`, a page orb was 300–500px with a 100px blur. Two
systems that shared a name; this decision only ever governed the second. The card orbs stay
untouched, under D4.

**`DecorativeBackground` is deleted, not converted.** Once the band carries both the dots and the one
light source, a second app-wide mechanism was doing the same job in a second way. The band replaced
it at all four mount sites.

**21 page-level orbs removed.** They were the second, third and sometimes fourth light source on the
same screen — auth alone had a top-down wash plus three orbs. Several were *animated*, which does not
just lose to this decision, it loses to a rule: motion is spent on state the user caused, never on
ambience, because movement is the one channel the eye cannot ignore.

**The four L1 headers were deliberately *not* merged**, which this entry and D12 both implied they
would be. They share about ten lines of markup — a tinted icon tile, an `h1`, a description — and
diverge in wrapper, extras (a back link, actions, stats, version metadata) and type scale. One
component covering all four means eight props and four modes, which is the thing that reads as one
component pretending to be four. What they actually shared was the band, and that is now extracted on
its own. The icon-tile duplication is still worth a look, separately.

**The play routes get the L1 band.** Quiz and flashcard are focused reading rather than dense
surfaces, so L0 does not apply to them by density — and a completely flat play screen reads as unset
rather than as calm. The band fades out above the question card, so the reading surface itself is
untextured either way.

### The seam against the sidebar — and why it kept coming back

**Corrected after the browser pass.** The band was first mounted inside each page header, and the
result was a visible vertical seam: the content column carried the warm glow while the floating
sidebar stayed neutral, so the two read as different surfaces.

**The cause is one line in `luma-sidebar.tsx`**: the panel is `bg-background/40 backdrop-blur-sm`, and
its own comment says the translucency exists *"so the shared app decor still bleeds through"*. It was
built as a **window onto a full-viewport background** — which is exactly what an anchored,
column-bound band stops being.

It also explains why this recurred under the old system: at 40% the sidebar always showed a *weaker
value of the same wash* than the content did. The two could never match; they were the same colour at
two opacities, and the seam was only ever a question of how visible.

Two things fix it, and both were needed:

1. **One band, mounted in the app shell** rather than in each header. It is the only place that spans
   the sidebar gutter — the four headers sit at different nesting depths (`UserHero` at the column
   root, `AdminPageHeader` inside `container > main`), so none of them can reach the viewport edge.
   Its level follows `isAuthenticated`, which maps onto L1/L2 exactly: logged out is the public pages,
   logged in is the app. 19 mount points became 12, and the 6 that remain are the surfaces genuinely
   outside `_app` — auth, quiz, flashcard, the error and not-found pages, maintenance.
2. **The sidebar becomes an actual window** — border and `backdrop-blur`, no fill. With nothing to
   match, a mismatch cannot exist; the separation comes from the border and the gap, per the Gestalt
   rule that spacing groups more reliably than colour.

**Two more light sources found and removed on the way:** the admin layout painted its own
`from-muted/20` top wash on top of the band, and `globals.css` declared **16 `--sidebar-*` tokens
across `@theme`, `:root` and `.dark` that no component has ever read** — the sidebar uses
`--background`. 24 lines deleted, in the spirit of D15.

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

## D16 — One step below `text-xs`, and one voice for the overline

**Decided and implemented 2026-08-10.** The named scale was already carrying the app — **798 uses**,
`text-sm` ×337 and `text-xs` ×251. The 61 arbitrary `text-[Npx]` values were not a scale the system
lacked; they were leaks out of the one it has. None of them was treated as a considered choice.

**The dense end gets exactly one new token.**

| Was | Now | Sites |
|---|---|---|
| `text-[11px]` ×11, `text-[10.5px]` ×5, `text-[12px]` | `text-xs` (12/16) | 17 |
| `text-[10px]` ×32, `text-[9px]` ×4 | **`text-2xs`** (10/14) | 36 |
| `text-[13px]` | `text-sm` | 1 |
| `text-[15px]` ×2 | `text-base` | 2 |
| `text-[24px]` ×2 | `text-2xl` — exactly equal | 2 |
| `text-[28px]` ×2 | `text-3xl` | 2 |

**Nothing below 10px.** At `text-2xs` a label is already at the edge of legibility, so there is
nothing left to spend — and 9px sat under `--muted-foreground`, which #152 already shows failing at a
larger size. **10.5px is not a step**; a half-pixel is an argument that lost. Both the 11px and the
10.5px sites go *up*, which is the only direction contrast allows.

**Where they came from:** 21 of the 61 were in `src/components/session-config/` alone — that one
component family had grown a private scale (28, 24, 15, 13, 12, 11 and 10.5px). It is the place where
this collapse is most visible and the first thing to look at in a browser.

### The overline is a utility, not fifty class strings

It was written **~50 ways**: three sizes, five trackings (`wide`, `wider`, `widest`, `[0.16em]`,
`[0.18em]`), three weights. A size token cannot fix that, so `globals.css` declares two utilities:

| | |
|---|---|
| `eyebrow` | 12px, 600, `0.1em`, uppercase — inside cards, panels, table headers |
| `eyebrow-lg` | 14px, 600, `0.1em`, uppercase — section openers on the public pages |

**Colour stays at the call site** — it is the one part that legitimately varies
(`text-muted-foreground`, `text-primary`, an area colour). Named `eyebrow` because Tailwind already
owns the class `overline`.

**48 sites converted. The rule that decided each one: a pill is not an overline.** A class string
carrying a background or a border is `Badge`'s job, and the four that have one were left alone.

`Badge` also gained a `size` variant — `sm` is 10px — which absorbs the seven call sites that were
overriding its type size by hand. Five of them were also re-declaring `rounded-full`, which the base
class already sets.

**Rules out:** a new `text-[Npx]` anywhere. If a size is missing from the scale, the scale is the
thing to change.

---

## D17 — `--font-mono` is DM Mono, and figures are not its job

**Decided and implemented 2026-08-10, closing O1.** O1's premise was wrong on two counts:

1. **Tailwind v4 declares `--font-mono` itself** — `ui-monospace, SFMono-Regular, Menlo, …`. Mono
   text was never unstyled, it was the *system* stack: machine-dependent, which is a different and
   smaller problem than undefined.
2. There was a **second** mono, and a worse one: `markdown.css` hardcoded
   `"Courier New", Courier, monospace` for flashcard code. That one was a genuine leak, and it is
   deleted — there is now one mono, not three.

**`font-mono`'s 27 uses were doing two jobs.**

- **Figures** (14 sites) — every chart tooltip, axis tick, gauge, count and the quiz timer. All of
  them already carried `tabular-nums`, which is the *only* thing mono was wanted for. `font-mono` is
  removed from all 14; the three that were missing `tabular-nums` gained it, because mono had been
  standing in for it. The digits now belong to the interface instead of reading as an inlay.
- **Code and identifiers** (11 sites) — the JSON import textarea, the error page's stack trace,
  department and campus codes, request IDs, version strings. Here a real monospace is the point.

`--font-mono` is therefore **DM Mono**: the same superfamily as DM Sans and DM Serif Display, which
is D3's own argument applied to the third role. One weight, 400.

**How to choose, going forward:** if the reason is *alignment*, it is `tabular-nums`. Only if the
reason is *that the text is code* does it get `font-mono`.

---

## D18 — The diagonal shafts are parked; one soft orb serves both levels

**Decided and implemented 2026-08-11**, adapted from a
[21st.dev pattern](https://21st.dev/@jatin-yadav05/components/elegant-dark-pattern). Three gradients
and no new dependency — the same primitives the band already uses.

**Outcome: the shafts ship nowhere, and D12/D13's single orb stands.** `--glow-alpha` is 0.18 light /
0.28 dark, turned up to 0.26 / 0.38 on L2 — the same light at two intensities, which is what D12 asked
for in the first place. The `band-beam` and `band-beam-fade` utilities and `--beam-alpha` are deleted
rather than left dormant: unused CSS is the thing this phase spent its time removing, and everything
needed to rebuild them is in this entry.

**Why it was parked, in order.** Scoped to L2 first. Then extended to L1, on the argument that two
grammars across the levels is the kind of seam D12 exists to remove — and seen on a dashboard it was
plainly too aggressive. Then pulled back to L2 only. Then pulled from L2 as well: even on a sparse
public page it asserted more than a page opener should.

**What the exercise was worth**, since the code is gone and the lessons are not:

- **One angle cannot do two jobs.** In a `linear-gradient` the colour bands run *perpendicular* to the
  angle, so the band axis and the travel axis are ninety degrees apart. The shafts were `30deg` with a
  `120deg` mask. Using one angle for both gives a wavefront, not a beam.
- **Check the mask before you turn the angle.** The first attempt read as a blob in the corner and
  "wrong corner" looked like the obvious diagnosis; the fault was a vertical mask eating the part that
  makes a diagonal diagonal.
- **A mask along one axis does not stop a hard edge on another.** At the bottom-left corner the travel
  mask was still only ~15% along its own axis — fully opaque — so the light ran into the layer's edge
  at full strength and cut a hard horizontal line. Fixing it needs a second, vertical dissolve, and
  since `mask-composite` is not dependable across browsers, the portable way to intersect two masks is
  to nest: **a parent's mask applies to its whole subtree.**
- **Percentage stops on a diagonal axis drift with the aspect ratio.** The top-left corner landed at
  21% of the band axis at 3440px wide against 51% at 1280px, so anything narrow only sits where you
  put it at one window size.

**The trick worth stealing is the gap, not the beam.** Streaks with `transparent` between them let
the page's own surface cut through, and *that* is what reads as light. Without it the identical colour
stops are a wash. The reference achieves its whole character with that one omission.

**Direction: in at the top left**, which keeps O7's answer for the orb that ships and for the shafts
that did not.

**Two angles, ninety degrees apart, and this is the whole geometry of the thing.** In a
`linear-gradient` the colour bands run **perpendicular** to the angle. So the *bands* are `30deg`,
which is what lays the shafts **along** the top-left → bottom-right diagonal; putting the travel
direction there instead lays the bands **across** it, which is a wavefront, not a beam. The **mask** is
`120deg` — the travel direction — so the shaft loses strength as it goes, and it is the mask, not the
colour stops, that empties the far corner.

It took three passes to land, and every wrong turn had the same root: **one angle cannot do both
jobs.** Pass one faded vertically, which ate the part that makes a diagonal diagonal and left a blob in
the corner. Pass two fixed the corner but still used one angle for bands and travel, so the stripes ran
across the beam. The lesson worth keeping: **when a gradient does not read as directional, separate the
band axis from the fade axis before you start turning angles.**

**Four shafts, not one, with uneven widths and strengths.** A single broad band reads as a floodlight;
light through slats reads as light. The unevenness is the point — four even stripes read as a pattern.
Spreading them across 5–84% of the band axis also settles a problem that a single shaft could not:
percentage stops on a diagonal axis drift with the aspect ratio, and the top-left corner lands at 21%
of that axis at 3440px wide against 51% at 1280px. One narrow shaft would only sit on the corner at
one window size; several always straddle it.

**Three masks, because two of them are doing different jobs and one element cannot hold both.** The
dots fade vertically. The light fades along its travel direction, `120deg` — and then needs a *second*,
vertical dissolve, because the travel mask is still only ~15% along its own axis at the bottom-left
corner, so it is fully opaque there and the light runs into the layer's bottom edge at full strength.
That was a hard horizontal cut across the page. `mask-composite` would compose the two on one element
but is not dependable across browsers, so the beam nests inside a wrapper that carries the vertical
dissolve: **a parent's mask applies to its whole subtree**, which is the portable way to intersect two
masks.

**Two layers, not one, because the two devices cannot share a mask.** This was the bug that made the
first attempt read as a blob: the dots fade *vertically* — that is what makes every dense surface
below the band flat — and a vertical mask applied to a diagonal eats exactly the part that makes it
diagonal, leaving the top slice in one corner. The light therefore fades along its **own** axis, and
runs taller than the dots (34rem against 20rem on L1), because a diagonal needs height to read as
one.

**One hue: `--primary`.** The reference is teal, which arrives cool and recedes; the same beam in the
brand orange is a warm mass across half the screen, and the colour rules give orange exactly one job —
brand and the primary action. Four candidates were compared in the lab, including a cool one, and a
new tint was rejected on the rule rather than on looks: it would be **a fourth colour with no job**,
and it could not borrow `--chart-2` because D4 forbids using the categorical palette as decoration.
`--beam-alpha` is `0.30` light / `0.34` dark — raised twice after the light theme read as barely
there both times — and the streaks step down from it by 0.85 and 0.5, so the whole beam re-tunes from
one number. **Light needs a bigger value than intuition suggests**, and the gap between the two themes
is much smaller here than it is for the dots: a translucent hue over white loses more than the same
hue over near-black.

**Not L1, and this was measured rather than assumed.** In the reference the dots never fade — they run
to the bottom of the page. Put that behind a table (`Style Lab/Fascio diagonale`, story 2) and it is
two grids competing plus a beam sliding under the rows: exactly what D12's governing principle
forbids. The beam therefore lives *inside* `page-band` as the L2 variant and does not replace it.

**How it composes:** the beam is the bottom layer of `page-band` itself, with the dots over it as in
the reference. It was briefly a separate `page-beam` utility feeding a `--band-beam` slot, which was
only ever needed to compose two `background-image` declarations — once the beam is the *only* light,
there is nothing to compose and the indirection went.

### Chrome sits above the light, and that means opaque

**A translucent surface is tinted by whatever passes behind it.** Invisible on a flat page, obvious
over a band — and it is what made the browse search field read as coloured from halfway across.

The cause was three `ui/` primitives: **`Input`, `Textarea` and `SelectTrigger` were `bg-transparent`**,
straight from the shadcn defaults. They are now `bg-background`. One edit each, every form control in
the app fixed.

Nine chrome bars were `bg-background/70` for the same reason — the navbar, the quiz and flashcard
headers, sidebars and navigation bars, the user breadcrumb. All opaque now. The floating sidebar goes
with them: it had lost its fill entirely to fix the seam (see D13), and an unfilled panel is a window,
which is the opposite of what chrome should be. It is `bg-background` with the border and the gap
doing the floating, and its `backdrop-blur` is gone because it had nothing left to blur.

**The rule, stated once:** a surface that sits *over* the band is opaque. Translucency belongs to
scrims and overlays — `sheet`'s backdrop, the map's loading veil, a toast — where seeing through is the
point. The `/80` and `/70` fills still inside `department-card` are fine: they sit on an opaque card,
not on the band.

**Rules out:** the beam on L1 or on any dense surface; a beam hue that is not `--primary`; a
translucent chrome surface anywhere the band reaches.

---

## D19 — A colour's surface value is not its ink value

**Decided and implemented 2026-08-11, closing #152.** `--primary` and `--destructive` were each doing
two jobs: the fill of a button and the colour of text. In light one value can serve both; on the dark
surface it cannot, and the app was carrying **3.52:1** for `text-primary` across ~143 uses and
**2.01:1** for `text-destructive` across 35 — the second is unreadable, not marginal.

**Two ink tokens, `--brand` and `--danger`.** In light they are *identical* to `--primary` and
`--destructive`, so the light theme did not move a pixel; in dark they are lifted and **more
saturated** than the surfaces they pair with:

| | light | dark | on the page | on `bg-muted` |
|---|---|---|---|---|
| `--brand` | `10 76% 42%` | `10 90% 62%` | 6.53:1 | 4.74:1 |
| `--danger` | `0 84% 47.5%` | `0 90% 68%` | 6.68:1 | 4.84:1 |

`bg-primary` and `bg-destructive` are untouched, so every button is exactly what it was. 178 uses of
`text-primary` / `text-destructive` moved to `text-brand` / `text-danger`.

**Why not simply lighten `--primary` in dark**, which would have been one token and no call-site
churn: it was tried and rejected on sight. Lifting the surface makes the primary button a pale orange
and forces its label from near-white to dark; the same treatment on `--destructive` turned a badge into
pink pastel. **A lighter hue reads washed out as a large fill and vivid as text on near-black** — which
is exactly why the two jobs need two values, and why the ink tokens carry higher saturation than the
surfaces do.

**Rules out:** using `text-primary` or `text-destructive`. They are surface tokens; `bg-*` and
`border-*` are their jobs.

### Measured, not assumed — and the four failures nobody had counted

#152 filed two failures. Measuring every pair against the real tokens found **twelve**:

- **In light, the status colours all failed as text.** `--warning` at **2.63:1**, `--success` 3.48,
  `--destructive` 3.78. The comment above them claimed they were "tuned for text/badge use"; they were
  not tuned at all. Darkening them fixed their *fills* too — a white label on `bg-warning` was 2.63:1.
- **`--warning` cannot be amber and compliant at once.** At H=38 it needs L=33 to clear 4.5:1, which
  is ochre. Moving 4° to H=34 buys the headroom while staying gold, and it is still 24° clear of
  `--primary`'s H=10, so warning cannot be mistaken for brand.
- **Tune against `bg-muted`, not the page.** Muted is 4% off white and costs ~0.4 of a ratio point, so
  every token tuned to exactly 4.5:1 on white failed the moment it landed on a tab, the admin sidebar
  or a stat block. Five tokens were re-cut for this after the first pass looked clean.
- **Use the real foreground token, not white.** `--destructive-foreground` is `210 40% 98%`, not
  `#fff`, and the difference was enough to hide a failing button label at 4.33:1 behind a passing
  measurement of 4.53.

**A pairing test is not a naming test.** `grading.test.ts` asserted that `getGradeColor` and
`getGradeChartColor` switch band at the same scores — by comparing substrings of the class names,
which quietly required both to be named alike. They are not, and legitimately: text takes the ink
token, a chart fill takes the surface one. The test now compares *where each function changes*, which
is the invariant it always meant.

---

## D20 — Undo for the reversible, confirmation for the rare

**Decided and implemented 2026-08-11, closing #154.** The app had **no undo anywhere** and eleven
confirmation dialogs, two of which were guarding reversible actions — which is exactly what wears a
confirmation out. A dialog's power is its rarity: shown often it becomes background noise and stops
being read, and then it is useless at the one place it matters.

**Undo is a toast that carries its own reversal.** `toastUndo` in `src/lib/toast.ts`, on Sonner's
`action` — no new dependency, no undo stack, no state machine. Ten seconds rather than the default
five, because a reversal has to be noticed, read and reached.

**`useMutationWithToast` takes an `undo` option**, receiving both the input that was sent and the
result that came back, so a reversal can address whatever the action created. Declaring it turns the
success toast into an undoable one — one line per hook:

```ts
undo: input => addDepartmentAdminFn({ data: input }),
```

The grant/revoke pairs share an input shape, which is what makes this a one-liner rather than a
refactor.

**Where undo now exists:**

| | Why |
|---|---|
| bookmark toggle | the rule's own example, and a toggle is its own inverse |
| unfollow a class | the rule's other example. The `courseId` rides along purely so the reversal can put it back — a row that has lost it gets a plain toast instead |
| revoke department admin · course maintainer · section access | these had **neither** a confirmation nor an undo, so a misclick silently took away someone's access |
| create the Exam Simulation sentinel | was a confirmation on a reversible creation; now it acts, and the undo deletes the row the service returns |

**Two confirmations were removed and one was deliberately kept.** The Exam Simulation dialog asked
*"Confermi?"* about a section you could delete in two clicks — gone. **The role change stays a
dialog even though it is reversible**, and the rule bends here for a reason: undoing a promotion ten
seconds later still leaves ten seconds of granted privilege. Reversibility is not the only axis; the
harm window matters too.

### The dialogs that stay say what happens, not "are you sure"

Ten dialogs, and every one opened with *"Sei sicuro di voler…"* — the exact phrasing the rules
already forbid. **`confirmation-dialog.stories.tsx` had the right pattern all along** ("Eliminare la
domanda?" plus the consequence) and not one call site followed it. They do now.

The descriptions state consequences, and the consequences were **checked against the schema rather
than assumed**: `questions → sections`, `sections → classes` and `courses → departments` all cascade,
so deleting a section really does take its questions. But deleting a *course* does not delete its
classes — only the `course_classes` links cascade, and the classes survive unlinked. That dialog now
says so, because an admin deciding whether to delete something needs to know what lives through it.

---

## D21 — One Italian word per level, and "corso" is not one of them for a class

**Decided and implemented 2026-08-11.** The queue carried this as "the data model says *class*, the UI
says *insegnamento*, and one label is abbreviated". The English-vs-Italian split is not a problem —
code is English, the interface is Italian. The actual problem was worse and inside the Italian:
**"corso" named two different levels of the hierarchy at once.**

The canonical vocabulary was already written down, by the component that explains the hierarchy to
users. `content-hierarchy-diagram` says: **Dipartimento → Corso di laurea → Insegnamento → Sezione →
Domanda.** Nothing new had to be invented; the app just had to say it everywhere.

| Entity | Word | Never |
|---|---|---|
| `departments` | dipartimento | |
| `courses` | corso *(di laurea where there is room)* | |
| `classes` | **insegnamento** | ~~corso~~, ~~classe~~ |
| `sections` | sezione | |
| `questions` | domanda | |

**Where it was broken:** the followed- and recent-classes feature — the user dashboard, `/user/classes`,
settings, the progress empty state, both nav entries, the landing copy and a skeleton — called classes
**"corsi"** in ~26 places. So "I miei corsi" listed insegnamenti, and a table column headed *Corso*
rendered `className`. A user reading "Corsi seguiti" next to "Corsi di laurea" in the same navigation
had no way to tell they were different things.

`user/mutations.ts` added a **third** word, toasting "Classe aggiunta alla tua lista" for the same
action the page called adding a corso.

**The abbreviation was a symptom, not the bug.** `Cerca insegn.` sat in the mobile tool grid because
the verb had eaten the width — and its sibling tiles are plain nouns ("Notifiche", "Novità"). Dropping
the verb fixes it without cutting a word short: **"Corsi di laurea"** and **"Insegnamenti"**.

**What was deliberately left alone:** `corso` where it really is a `course` — the browse and admin
course pages, `/search/courses`, the maintainer copy, the department course counts. Those were right
all along, and they only read as ambiguous while classes were also called corsi.

**Rules out:** "corso" or "classe" for a `class` in user-facing copy; abbreviating an entity name to
fit a control — resize the label, not the vocabulary.

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

### Measured against the app on 2026-08-09, fixed on 2026-08-11

Three failures, computed rather than eyeballed — they are tracked as issues, not fixed here:

| | Measured | Required |
|---|---|---|
|`text-muted-foreground` on `bg-muted`, light|~~4.39:1~~ → **4.58:1**|4.5:1|
|`text-primary` as text on the dark surface|~~3.51:1~~ → **6.53:1** as `text-brand`|4.5:1|
|Icon-only buttons with an accessible name|~~6 of 26~~ → **26 of 26**|all|

Tracked as #152 (contrast), #153 (accessible names, and target size with it) and #154 (undo).
**All three are closed — #153 and #152 on 2026-08-11, #154 the same day. See D19 and D20.**
**#153 is closed — 2026-08-11.** Four things are worth keeping from it:

- **A tooltip is not an accessible name.** Radix `Tooltip` sets `aria-describedby`, not
  `aria-labelledby`, so `bookmark-button` and `report-button` read as unnamed despite having perfectly
  good tooltip text. A description supplements a name; it does not supply one.
- **Name the object, not the action.** `AdminRowActions` gained a `label` prop, so a table reads
  "Modifica Analisi matematica I" rather than twenty identical "Modifica". 4.1.2 is satisfied either
  way; only one of the two is usable. One prop covers five tables.
- **A name can arrive from another file.** Radix `Slot` merges the parent's props onto the child —
  `mergeProps` returns `{...slotProps, ...childProps}` — so `<Button asChild aria-label>` names the
  `<Link>` it wraps. A static audit cannot see that across a component boundary, which is why six
  sites looked unnamed and were not.
- **Target size (2.5.8) was four sites, not a systemic problem.** `Button`'s `icon` size is 40px and
  `sm` is 32px, so the components clear 24×24 on their own; the failures were four revoke chips inside
  badges, hard-coded to `h-4 w-4` — 16px. Now `size-6`. The `@media (pointer: coarse)` 44px block in
  `globals.css` is an enhancement and never discharged 2.5.8, which applies to every pointer.

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

**O1 — ~~`--font-mono` is undefined~~ → answered by D17**, which also corrects the premise: Tailwind
v4 declares the token itself, and the real leak was a second hardcoded Courier New in `markdown.css`.

**O2 — The badge audit is unfinished.** Roughly 70 badges across 33 files have not been reviewed
against D6. Most look legitimate; the sweep needs a human pass, not a regex.

**O3 — The rest of the system.** The type scale is answered by D16. Still to decide under #145:
surfaces and elevation, the radius scale bound to `--radius`, the shadow tokens that would replace the
duplicated focus ring and CTA glow, and the motion rules. Contrast is a gate on all of them, checked
in light first per D2.

**O4 — ~~The icon set~~ → resolved by D11 (Solar); both leftovers closed on 2026-08-10.** The mapping
table is `docs/ICON_MAP.md`, and the CC BY 4.0 credit ships in the landing footer *and* on the about
page — the footer alone was not enough, since it only renders for unauthenticated users while logged-in
users see the same icons.

**O6 — ~~Gradients~~ → answered by D13, D14 and D15**, except for what O7 and O8 carry.

**O7 — ~~Which direction does the light come from?~~ → answered inside D13 on 2026-08-10: top left**,
and the per-component orbs are out of scope because they are a different scale. Original note:
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
| 2026-08-10 | D16–D17: one step below `text-xs`, the overline as a utility, `--font-mono` on DM Mono; O1 closed, the type scale struck from O3 |
| 2026-08-10 | D12–D13 implemented as one band per page instead of a page-height falloff; O7 answered (top left); `DecorativeBackground` and 21 page orbs deleted |
| 2026-08-11 | D13 corrected after the browser pass: one band in the shell, the sidebar made a real window, 16 dead `--sidebar-*` tokens deleted |
| 2026-08-11 | D18: L2 takes a diagonal beam on `--primary`, L1 keeps the anchored glow — one device per level |
