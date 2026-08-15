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

### The tint stays on the raw palette, 2026-08-13

`#118` wanted these on the token system, and the categorical ramp was the obvious home — a stat tile's
tint is keyed to a section, always beside a label and an icon, which is the same case as a department
area. Built, compared side by side in both themes, and **rejected on the look**: at 10% the washes are
near-identical but the icon is not, and `chart-5` is an ochre where `yellow-500` is bright.

So the tints keep their raw values, deliberately. **The price, accepted:** they are theme-constant and
outside the contrast gate. Do not file it again as an oversight.

**No `--decor-*` ramp either**, tempting as it was — Tailwind exposes its palette as variables, so the
current values could have been tokenised without moving a pixel. D26 rules out "a further categorical
ramp alongside this one", and that is exactly what it would be.

### The blurred orb is retired for CardTexture, 2026-08-14

The **per-card orb** — the blurred `CardOrb`, one of D4's decorations — is **retired** in favour of
D27's `CardTexture`: a card-scale decoration now reads as a faded corner dot field, not a coloured glow.
`CardOrb` is removed from `card.tsx` and its ~8 uses migrated (`StatCard`, the two progress panels, the
flashcard result hero). **The rest of D4 stands** — the tint maps (`decorativeTint`: the icon tile, the
icon, the border and the gradient) are untouched, so decorative colour was not stripped, only its glow
form. The `orb` slot went with it: the last hand-rolled orb (the `user/index.tsx` quick-links) also
moved to `CardTexture`, keeping its colour gradient, so the `orb` field is deleted from `decorativeTint`.

What did change is structural and invisible: the two maps became one
(`components/shared/decorative-tints.ts`), and `orange` and `red` went, having never been passed.
`yellow` and `amber` both stay — they are 16° apart and both in use, so the divergence I first read as a
key mistake was two deliberate tints.

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

### The one deliberate exception, 2026-08-13

The dissolving numeral on the error pages (`gradient-text-fade`, used by `ErrorNumeral`) carries a
hairline of page colour one pixel below the glyph. That is this decision's mechanism exactly: a light
and a shadow used to fake relief.

It is allowed there, and the reason matters more than the exception. **D8's objection is about
contrast** — a control whose *form* is carried by two shadows cannot guarantee that its shape reads,
and a control has to read. The numeral is `aria-hidden` decoration: it carries no information, it is
not operable, and the heading beside it says what happened. Nothing depends on the illusion working.

So the boundary is not "no light-and-shadow anywhere" but **"nothing whose meaning or operability
depends on it"**. Do not carry the trick to a button, a card, an input, or anything a screen reader
should reach.

---

## D9 — ~~AutoAnimate for list transitions~~ → reversed, not adopted

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

**Status: reversed on 2026-08-12, before it was ever installed.** Framer Motion stays the app's only
motion dependency.

The cost was never the objection — 3.2 KB gzipped, zero dependencies, and it is the one motion library
here that reads `prefers-reduced-motion` itself and disables itself, verified in its source rather than
its README. Three constraints also checked in the source, all real: only **immediate** children animate
(a `childList` observer with no `subtree`, so a wrapper div between container and items switches it
off); it assigns `position: relative` to a `static` parent, which silently **moves the containing block
for absolutely-positioned descendants** — and this app puts badges, counters and orbs in absolute
position inside cards; and it fights `flex-grow: 1` children.

**What actually killed it is a collision this entry did not anticipate.** Three of the five surfaces it
named already animate with Framer: `notification-list` wraps every item in a `motion.div` with stagger
variants, and `user/requests` and `user/bookmarks` do the same. AutoAnimate and Framer would both be
writing transforms onto the same elements. Only two surfaces were clean — the faceted filter chips and
the question editor's option rows — and two surfaces do not earn a second motion engine.

**Rules out:** a second motion dependency. List add/remove/reorder, if it is wanted, is Framer's job
through the existing `withReducedMotion` helpers.

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

**Amended by D27 (2026-08-14):** a single card may opt into a *bounded* dot accent in its **empty**
corner — faded out before it reaches content — which keeps this entry's governing principle (texture
gone before density) rather than breaking it. The removal of per-*surface* dot fields stands; a sparse
card is the one opt-in, and dense surfaces (L0) stay flat.

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

**Decided 2026-08-09, and only fully implemented on 2026-08-12** — worth recording, because the earlier
half was easy to mistake for the whole. The dot fields, `.chart-plot` and the 16 dead `--sidebar-*`
tokens went with D12/D13, so this decision read as done while **four class blocks and six hardcoded
hexes were still in the file**. A decision is not implemented until the grep comes back empty.

Four classes in `globals.css` had **zero usages** in the app: `.quiz-progress`, `.quiz-timer`,
`.auth-glass-effect`, `.social-auth-btn`. Verified against `src/`, `public/` and `docs/` — the only
external mentions were in `DESIGN_SYSTEM.md`, now corrected. The custom `@keyframes pulse` went with
them: `.quiz-timer.warning` was its only user, and it was byte-for-byte Tailwind's own, so the three
`animate-pulse` sites in `map.tsx` were unaffected either way — **a custom keyframe named like a
Tailwind one silently shadows it**, which is worth knowing before adding another.

Two of them (`.quiz-timer`, and the scrollbar block that stays) are the last places holding
hardcoded brand hexes — `#d14124`, `#dc2626`, plus six in the scrollbar. **The remaining #118
"brand hex" item is therefore resolved by deletion, not by conversion**, except for the scrollbar,
which stays and goes onto tokens.

**The scrollbar keeps the brand, quietly** — settled 2026-08-09, applied 2026-08-12. The thumb was
solid `#d14124`, which made it the loudest brand element on a long page, competing with the primary CTA
for attention while being pure chrome. It is now `hsl(var(--primary) / 0.4)` at rest and full
`--primary` on hover, with the track on `--muted`. The signature survives; the shouting does not.

**The three `.dark` scrollbar overrides went too**, and that is the point rather than a side effect:
they existed because the light rule was a hex, so dark needed its own hex — and they had drifted to a
grey thumb, meaning the brand signature only existed in one theme. One tokenised rule serves both.
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

## D22 — The focus ring is declared once, and a halo uses the token its dot uses

**Decided and implemented 2026-08-11.** `--shadow-focus` replaces seven identical copies of
`shadow-[0_0_12px_hsl(var(--ring)/0.15)]`, one in each of the `ui/` primitives that can take focus —
tabs, switch, button, radio-group, checkbox, input, textarea.

This is not tidiness. **2.4.7 asks whether focus is visible everywhere**, and seven copies is seven
places to check and one place to forget. One token is verified once.

**And a find that was not on the list:** `news.tsx` drew the changelog dots with **raw rgba** —
`rgba(34,197,94,…)`, `rgba(59,130,246,…)`, `rgba(245,158,11,…)`, which are green-500, blue-500 and
amber-500 — beside `bg-green-500` and friends. Those dots were **entirely outside the token system**,
which is why they never received D19's contrast re-tuning: nothing reached them. They are now
`bg-success` with `shadow-halo-success`, and the halo derives from the same token as the dot, so the
two cannot drift apart.

**Left alone, with a reason:** the two floating chrome panels keep
`shadow-[0_8px_32px_rgba(0,0,0,0.06)]` and its upward twin. They are black on near-black in the dark
theme, so they do nothing there — but both panels are also defined by a border, so it degrades
rather than breaks. Two sites, one real defect, not worth a token yet.

**`shadow-lg shadow-primary/25`** — the CTA glow, 12 sites — stays as it is. It is a two-class
Tailwind-native composition, not an untokenised recipe.

---

## D23 — Icon motion is a CSS transition on state the user caused

**Decided and implemented 2026-08-12, closing O5.** No animated icon set, and no Framer Motion for
icons. The question O5 posed was "animate a handful of Solar icons with Framer, or drop the idea"; the
answer is neither quite — **the app already animates icons, in CSS**, and that is the right mechanism.

`theme-toggle` crossfades sun and moon with `transition-transform` plus `scale`/`rotate` and already
carries `motion-reduce:transition-none`. Five `ArrowRightIcon`s translate on hover. The spinner spins.
The capability was never missing.

**Why CSS and not Framer, given Framer is already a dependency:** CSS transitions are covered by the
`prefers-reduced-motion` block in `globals.css` and by `motion-reduce:` — for free. Framer writes inline
styles from JavaScript and is untouched by that block, which is why `useReducedMotion` exists and why 28
files have to remember it. Choosing Framer for icons would take on the app's most repeated hazard in
exchange for more elaborate icons that no rule asks for.

**Which icons earn it.** The rule is that motion is spent on state the user caused, so the candidates
are the icons that *are* a state the user just toggled. There are four two-state swaps in the app, and
only two qualify:

| | swap | verdict |
|---|---|---|
| `bookmark-button` | `BookmarkIcon` ↔ `bold/bookmark` | **yes** — D11's style axis already supplies two drawings of one icon, so the crossfade is half-built by the icon system |
| `password-input` | `EyeIcon` ↔ `EyeClosedIcon` | **yes** — the two drawings differ legibly |
| `quiz-header`, `flashcard-header` | `SidebarIcon` ↔ `SidebarMinimalisticIcon` | **no** — and this is the useful one: the two Solar drawings differ only in weight of detail, which `ICON_MAP.md` already flags. **Animating a swap between near-identical drawings advertises that they are near-identical.** The problem there is the icon, not the motion |
| `department-card` | `AreaIcon ?? BuildingsIcon` | no — a fallback, not a state |

**The price, for the record:** about six lines per site, no dependency, and no guard to remember. The
duration is 200ms because `motion.ts` already calls ~200ms the speed of press feedback, and a toggle is
press feedback.

**Rules out:** Framer Motion for an icon; animating a swap whose two drawings do not read as different.

---

## D24 — Radius steps by 4px, and a child in the corner steps down one

**Decided and implemented 2026-08-12.** `@theme` derived `--radius-sm/md/lg/xl` from `--radius` but
left `2xl` and `3xl` at Tailwind's defaults, which slid the control half of the ladder one step too
round and collapsed two names onto one value:

| class | rendered | `DESIGN_SYSTEM.md` claimed | now |
|---|---|---|---|
|`rounded-sm`|8px|4px ✗|4px|
|`rounded-md`|10px|undocumented|pinned to `lg`|
|`rounded-lg`|12px|8px ✗|8px|
|`rounded-xl`|**16px**|12px ✗|12px|
|`rounded-2xl`|**16px**|16px ✓|16px|
|`rounded-3xl`|24px|24px ✓|24px|

**`rounded-xl` and `rounded-2xl` rendered the same 16px** across 433 uses, so a button inside a card
was as round as the card and the control lost its step of hierarchy. The doc was wrong on three rows
of six — and it was the doc that had it right, which is why the fix is to move the code to the doc
rather than the reverse.

**Every step now derives from `--radius`** — `−8` / `−4` / `0` / `+4` / `+12` — so that token is
finally the one knob it was described as. Before, changing it left cards and large containers where
they were.

### Why 4px steps, and not tidiness

The steps are 4px because **the app's tight paddings are 4, 6 and 8px** (`p-1`, `p-1.5`, `p-2`). For a
child inset by padding `P` inside a parent of radius `R`, the concentric radius is `R − P`: the two
arcs then share a centre and the gap between the borders stays even around the curve. A child at or
above its parent's radius pushes out of the corner and the gap swells exactly there. With 4px steps,
`R − P` lands on **another step of the scale** instead of between two — which is the whole reason the
ladder has the spacing it has.

Measured across every parent carrying both a radius and a tight padding — 6 real pairs — the primitives
were already concentric: `DropdownMenuContent` `rounded-xl p-1` → `rounded-lg` items is `12 − 4 = 8`
exactly, and so is `TabsList`. **The only two failures were the two hand-rolled dropdown panels**
(`luma-sidebar`, `navbar`), and they failed on the *padding*, not the radius: both had invented `p-1.5`
where the primitive they duplicate uses `p-1`. Fixing the padding made both concentric with the radius
they already had. A 4px scale is what turned a 2px error into something arithmetic could catch.

### The limit of the rule, which the first audit got wrong

Applied to every parent with any padding, the check flagged **58 of 64 pairs** — which was the rule
being wrong, not the app. Concentricity only bites while the child's corner sits *inside* the parent's
corner, in practice **`p-2` and under**. At `p-4` the child is 16px away from the parent's arc; the two
curves are not adjacent, there is nothing to share a centre with, and the child takes the radius of its
own role. The audit's own output said so: those rows compute an "ideal" of 0 or negative.

### What the change costs, and the fact that argued for it

Buttons, inputs and selects go from 16px to 12px — small, but on every control. The fact that settled
it: `Button`'s `sm` size is `h-8`, and 16px is **exactly half of 32px**, so every small button in the
app was a stadium — the same silhouette as `Badge`, which is `rounded-full`. **84 `size="sm"` buttons
could not be told from a badge by shape**, leaving colour as the only signal. At 12px a small button is
37% of its height: a rounded rectangle, unmistakably not a pill.

`rounded-md` is retired from use — 25 sites moved to `rounded-lg` — but the token stays, pinned to
`lg`, so reaching for it out of shadcn habit cannot land on Tailwind's off-scale 6px.

### Addendum, 2026-08-12 — `--radius` moved to `1rem`, and this is what that costs

The **ladder** above is the decision and it stands. The **value of `--radius`** is not part of it, and it
moved from `0.75rem` to `1rem` the same day, because the drop was visible in the app: three of the five
steps had lost 4px, and on a small component 4px is a large fraction. `rounded-lg` going 12 → 8 across 73
sites is where "everything got rectangular" actually came from — I had reported the button change and not
that one, which was the bigger share of what a person notices.

At `1rem` the small end lands **exactly on its pre-D24 values** — `sm` 8, `lg` 12, `xl` 16 — while cards
and page containers gain 4px. Concentricity re-measured across the app: still 0 violations. And the docs
needed **no edit at all**, which is the first return on not copying values into them.

**What comes back with it, and was the fact that justified D24 in the first place:** `Button` size `sm` is
`h-8`, so a 16px radius is exactly half its height and every small button is a stadium again — the same
silhouette as a `rounded-full` badge, across 84 sites. That was accepted knowingly this time, on the look.
The cheap mitigation, if it ever grates: `h-8` → `h-9` puts the radius at 44% of the height and is still
on the 4px scale.

**Rules out:** a radius that is not a step of the scale; a child in its parent's corner rounder than
`R − P`; `rounded-md` in new code.

---

## D25 — A card is elevated in light; in dark a surface is separated by its border

**Decided and implemented 2026-08-12.** The premise of the open question was wrong twice over. It was
not ~30 hand-rolled recipes but **69 surfaces**, and it was not invisible: `<Card>` carries `shadow-sm`
while **59 of the hand-rolled surfaces carry no shadow at all**, so the app had two card looks and which
one a surface got depended on the spelling its author reached for. `<Card>` is used 25 times, and 11 of
its 13 files are admin routes — the primitive had effectively become the admin card while the rest of the
app wrote a flat one by hand. `DESIGN_SYSTEM.md` declared `shadow-sm` the base, i.e. it described the
minority.

**The elevated card wins.** I argued the other way — reserve elevation for what actually floats, since a
panel in the page flow is a region and a region is separated by a border — and the user rejected it on
the look, which is theirs to judge: the shadow earns its keep in light. So the doc was right here too,
and the flat spelling was the deviation.

### ~~The half that was actually broken~~ → reversed on 2026-08-12, and this is the part to read

The dark half of this decision **was reverted the same day it shipped.** What follows is what was
tried, why it looked right, and why it still lost — because the measurement was never the problem.

The observation that started it was the user's: the elevated card adds nothing *in dark*. That much is
mechanical — `--card`, `--popover` and `--background` were all `224 71% 4%`, so a shadow had nothing to
fall on and a card was the page with a border round it. The proposed fix made the neutrals a ladder:

| | dark | ΔL* from the page |
|---|---|---|
| `--background` | `224 71% 4%` | — |
| `--card` | `224 55% 9%` | 3.5 |
| `--popover` | `224 50% 12%` | 6.5 |
| `--muted` | `215 28% 17%` | 14.5 |

**Rejected on the look**, at +5 as shipped and with +3 and +7 alongside it: *"questo colore non mi
convince per nulla, nemmeno sulle card, torniamo a come eravamo prima."* So `--card` and `--popover` are
identical to `--background` again, and **in dark a surface is separated by its border** — not by its
fill, and not by a shadow, which does little there anyway.

**The lesson is not "the numbers were wrong."** They were right: ΔL* 3.5 is a perceptible step, the
contrast held with room, and the reasoning about shadows on near-black is sound. The lesson is that
**this app's dark theme is deliberately flat, and that is a taste, not an oversight.** It had already
been said twice about accent surfaces (`--primary`, `--destructive`); I argued a neutral grey was a
different case, and it is different *mechanically* — but not to the eye that has to live with it. Do not
re-derive this a fourth time.

What survives of the reasoning, because it is still true and cost nothing: **`bg-popover` is the token
for a thing that floats**, and `dialog`, `alert-dialog` and `sheet` were on `bg-background`. With the
two tokens equal again the change renders identically, but the roles are now named correctly, so if the
ladder is ever revisited there is one value to move rather than a hunt.

**Read surface adjacency in ΔL\*, not as a contrast ratio** — that stands on its own, and is the piece
of this decision most likely to matter again.

**One metric was the wrong one, and that part is worth keeping.** The contrast *ratio* of a lifted card
against the page is 1.07, which looks like nothing, and the card's own border drops from 1.38 to 1.28 —
both readings that would argue against the change. Both are the wrong metric: a luminance ratio answers
"can text be read on this", not "can two large adjacent surfaces be told apart". In **ΔL\***, the lift
was 3.5 (clearly perceptible, where +3 would be 1.9 and barely so) and the border kept **ΔL\* 11**. The
gate gained four rows — text on `popover`, and `border` on `card` — which are now duplicates of their
`background` equivalents and are kept anyway, since they are what would catch a future divergence.

### What was and was not swept

Many of these cards will be deleted outright as the feature issues land, so a 69-site sweep would be
throwaway work. Converted: the **12 surfaces in shared components** that survive that rework. Left
alone: **25 in routes** (they go with the page rewrites, #146–#148) and **15 in skeletons**, which have
to mirror their page and would break the mirror if they moved first. Two more stayed because `Card` has
no `asChild`: a `<Link>` in `legal-related-docs` and a `motion.li` in `notification-list`. The token
change reaches every `bg-card` regardless of spelling, so the part that carries the value did not wait
for the sweep.

`<Card>` also lost `transition-all duration-300` in favour of `transition-shadow`: the only property
that changes at rest is the shadow, and `transition-all` animates layout properties on every card in the
app. No call site depended on it — the six that animate a transform declare their own transition.

### The two tiers that had no name

- **`level="panel"`** — the page-level surface at `rounded-3xl` (10 sites: quiz and flashcard results,
  the legal gate, the three settings blocks). Radius only; **padding stays with the caller**, because
  those ten sites use three different paddings and baking one in would be wrong for half of them.
- **`CardOrb`** — D4's blurred decoration, which ~10 surfaces rebuilt by hand at three sizes. Size and
  corner are separate axes and every class is written out, since Tailwind scans source text and never
  generates a class name assembled at runtime. **The tint stays a prop**: the decorative colour is D4's
  and is not up for revision here.

**Found, not fixed:** that decorative colour is two independent maps of raw Tailwind families
(`stat-card.tsx` and `user/index.tsx` — `blue-500`, `yellow-500`, `emerald-300`, `orange-300`), outside
the token system and unable to respond to the theme. Recorded for whoever decides D4's palette; touching
it here would have been a colour change smuggled into a structural one.

**Rules out:** a flat card in the page flow **in light**; `bg-background` on anything that floats;
reading surface adjacency off a contrast ratio; **and re-proposing a lifted dark surface, neutral or
not.**

---

## D26 — Category is not status, and the categorical ramp needs an ink half

**Decided and implemented 2026-08-12.** #118 framed its largest section as *"migrate the scattered
colour maps onto the status tokens"*. That instruction is wrong, and the reason comes before anything
else: **those maps encode category, not status.** A course type, a department area, a role, a changelog
kind and a request type are *identities*; `--success` / `--warning` / `--info` mean an outcome. Painting
BACHELOR green would state that being a bachelor's degree went well.

The rules already name the right home — *`--chart-*` for data identity* — so this needed no new concept,
only the ink half of a ramp that already existed.

### Why the ramp could not simply be borrowed

Measured before writing anything: **every `--chart-*` slot fails as text**, at 3.35–3.99 in light against
the 4.5 floor, and three of five fail in dark on `bg-muted`. They are fills on a plot. This is **D19 for
the third time** — a colour's surface value is not its ink value — so `--chart-N-ink` inherits the hue and
saturation and re-tunes only the lightness, clearing 4.7 on `bg-muted`, the binding surface. A pill is
then `bg-chart-N/10 text-chart-N-ink border-chart-N/30`: one slot, both renderings, and a chart series now
shares its hue with the category pill beside it.

### Two wrong turns, both caught by measuring

**A new five-hue ramp was the wrong answer, and the search proved it.** Optimising five hues for
separation under deuteranopia and protanopia — Viénot projection, ΔE in Lab — reached a best worst-case of
only ΔE 18.9, and kept landing on hues adjacent to `--warning` (34) and `--success` (142). The status
palette already occupies four useful hue positions, so a further categorical ramp that avoids them, clears
4.5 and survives CVD is over-constrained. Reusing `--chart-*` sidesteps the whole problem.

**The first optimiser run measured the wrong thing** and returned `(45, 135, 150, 180, 210)` — two greens
15° apart. It maximised the CVD minimum while ignoring normal vision, so it produced a set more legible to
a colourblind reader than to everyone else. An accessibility objective that does not also hold the
ordinary case is not one.

### What the chart palette's own comment already knew

`--chart-*` carries a note that blue↔violet is the pair that collapses under CVD, and that slots 2 and 4
are kept **non-adjacent** for exactly that reason: a chart assigns series in slot order, so the collapsing
pair is never neighbours in a legend. Measured today they are ΔE 3.0 apart under deuteranopia — **known
and mitigated, not a regression.** I nearly filed it as a defect before reading the comment.

That mitigation does not transfer. Department areas need all five slots at once, unordered, so they *do*
put chart-2 beside chart-4. It holds anyway because **every area also renders its own icon** — 1.4.1 is
satisfied by the icon and the label, not by the hue. Recorded in `constants.ts`, where the risk lives.

### The status half, which needed no decision at all

`grading.ts` had already settled the convention and was already on tokens: `danger → warning → info →
success` for bands of merit. So the status-shaped maps just follow it — `getDifficultyColor` and
`RequestStatusBadge`, 32 classes — with `NEEDS_REVISION` moving from orange to `--info`, because orange
against amber was a distinction nobody could see and the two states now differ visibly.

**`getScoreColor` was deleted rather than migrated.** Zero callers, no test, and it graded on *different
band edges* than `getGradeColor` (30/25/20 against 18/24/27): two functions disagreeing about what a score
means, one of them dead.

`getGradeColor`'s top band was the last raw colour in that file, a bare `purple-600`. It is now
`text-chart-4-ink`, which finally pairs it with the `var(--color-chart-4)` its own chart twin was already
returning for the same band.

### Where this leaves #118

433 raw palette classes → **325**. The remainder is not one job: ~283 are scattered through pages that
#146–#148 will rewrite, and 38 are D4's decorative tint, which needs D4's palette decided rather than a
blind migration. The five gate rows added here mean a category can no longer be introduced below the floor.

**Rules out:** a category on a status token; borrowing a `--chart-*` fill as text; a further categorical
ramp alongside this one; optimising an accessibility metric without holding the ordinary case.

---

## D27 — A card may carry a bounded corner texture

**Decided 2026-08-14.** Taken from a ReUI pro block we could see but not read, and reproduced with our
own dots and tokens rather than adopted. A `CardTexture` in `card.tsx` lays a corner-anchored dot
field, faded out radially, with an optional primary glow. Its parent needs `relative overflow-hidden`.

This is an exception to D12, drawn narrowly so it does not become one. D12 removed every per-surface dot
field and put the texture in one band, on the principle that **the texture has to be gone before the
content gets dense.** D27 keeps that principle and adds a single opt-in: one card may carry the texture
**in its empty corner**, where no content sits, faded before it reaches the text. It is a corner detail,
not a field behind content — dots never go behind a table, a chart, a form or a list, which stay D12's
flat L0.

The rules, which are what make it safe:

- **The dots sit in the empty corner, opposite the content**, never under text. A text card keeps its
  content top-left, so the detail goes bottom-right; the radial mask fades it out before the words. This
  is D12's "gone before density," applied inside one card.
- **Off by default, opt-in per card.** `CardTexture` is mounted deliberately, not baked into `Card`.
  Most cards stay flat.
- **The glow is off by default, and card-scale.** On only for large or wide cards — a stat tile, a flow
  block. Being tens of pixels in a corner it is card-scale, so it lives under D4/D13's
  card-decoration carve-out; it is not a second page light source.
- **A category's colour stays on the icon, never on the dots.** The dots are `--foreground`; a category
  is carried by the icon, in the chart tint (D26). Colouring the dots
  would make texture read as meaning.
- **The alphas are tokens** — `--card-dot-alpha` (0.16) and `--card-glow-alpha` (0.14), one value for
  both themes to start. Dark gets its own the moment it needs one, by an override in `.dark`, never a raw
  alpha at a call site. The geometry (12px pitch, the corner-anchored radial mask) stays in the component
  as the effect's shape; only the theme-varying alphas are tokens.

**Rules out:** a dot field behind dense content (still D12's L0); a texture baked into every `Card`; the
glow as an ambient page light; a category colour on the dots; a raw alpha at a call site instead of the
token.

### Reworked to a pixel field on the content, 2026-08-15

The dot grid is replaced by a **pixel field** — a static reproduction of a "pixel card": a tiled grid of
tiny squares at variable size and tone, monochrome on `--foreground`, faded by a `placement`. The page
already wears the dot band (D12), so a card echoing it added nothing — so **two rules above are
reversed**: the texture now sits *on* the content (a feature/stat card under its top-left icon → `tl`,
the flow box → `center`), and a content-rich card **lowers `alpha`** (a prop) rather than dropping the
texture. `placement` (full / top / bottom / left / right / the four corners / center / ellipse / edges)
supersedes `corner`, kept as a back-compat alias. The **orb is retired** — `glow` and `--card-glow-alpha`
are gone — and the alpha token is `--card-dot-alpha` → `--card-pixel-alpha` (0.3). Every call site moved
to `placement` per content, with a lower per-card `alpha` on the colour-icon cards so the mark stays a
detail; the launch cards also drop their D4 gradient wash.

**Rules out (updated):** the empty-corner rule (the mark goes on the content now); the dot grid; the orb.
Still standing: no full-strength texture over genuinely dense content — lower `alpha` instead — and a
category colour stays on the icon, never on the pixels.

---

## D28 — The canvas and the surfaces are two tones; the light neutrals go cool

**Decided 2026-08-15.** D25 left the page and the surfaces on one value — a card was separated from the
page by its shadow (light) or its border (dark), nothing else. Revisited: that flat sameness read as
*basic*, and light was pure `#FFFFFF` everywhere with no identity of its own, where dark at least had a
colour.

The fix is the **inverse of the ladder D25 rejected.** D25 tried to *lift the card* — recolour the
surface the user liked — and lost on the look ("non mi convince nemmeno sulle card"). Here the card is
**kept** and the **canvas** moves: `--card` / `--popover` hold their value, `--background` shifts to
another tone, so a surface separates by tone as well as by shadow/border. What D25 rejected — touching
the card — is not done.

Both themes now run **canvas ≠ surface**:

| | light | dark |
|---|---|---|
| `--background` (canvas) | `220 20% 97%` (was white) | `222 22% 7%` (was `224 71% 4%`) |
| `--card` / `--popover` (surface) | `214 65% 98%` (was white) | `224 71% 4%` (kept) |

In **light** the surfaces take a cool tint — a whisper of hue, because grey-only read as *faded* — and
the whole neutral family was re-cut cool and cohesive so it holds together and `bg-muted` reads on the
tinted card: `--muted`/`--secondary`/`--accent` `216 16% 94%`, `--muted-foreground` `216 13% 44%`,
`--border`/`--input` `216 20% 88%`. In **dark** the surfaces already had identity, so only the off-hue
neutrals were aligned from `215` to the card's `224` (`224 28% 17%`, `--muted-foreground` `220 13% 66%`),
the canvas lifted to `222 22% 7%`, and `--dot-alpha` raised to `0.28`.

**`--muted`'s lightness is pinned by the gate.** `bg-muted` is the surface the contrast test measures the
status inks and the `chart-N-ink` pills on, so it cannot be darkened for visibility without dropping them
below AA. Bringing muted down to read on the tinted light card (`96% → 94%`) put four status inks at
~4.3:1, so they were nudged a step deeper — `--danger` `45%`, `--success` `28%`, `--warning` `31%`,
`--info` `48%` — back over 4.5:1 on muted. No floor was lowered; the gate stays green.

Tables followed: the one `DataTable` wrapper was transparent, so on the tinted canvas a table read as the
page. Its `bordered` surface is now a card like any other.

With the canvas separating a card by tone, the elevation was **softened**: `<Card>` (and the table
surface) moved from `shadow-sm` + a full border to **`shadow-xs` + `border-border/50`** — the tone does
the separating, the shadow and border only confirm it.

**Rules out:** a pure-white light surface, or a light neutral family left grey against a tinted canvas;
the dark canvas and the dark card sharing one value; a transparent `DataTable` surface; darkening
`--muted` past the point where a status ink or a `chart-N-ink` clears 4.5:1 on it. Still forbidden, per
D25: **lifting or recolouring the card itself** — D28 moved the canvas, never the surface.

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
  destruction and error; the status tokens for status; `--chart-*` for data identity, with
  `--chart-N-ink` as its text half (D26); `--heat-*` for magnitude. The decorative card colour of D4 sits deliberately outside that list and must
  never be readable as meaning.
- **Contrast is a gate, not a review step**, and it is checked in light first (D2). Since 2026-08-12
  that is literal: `src/styles/contrast.test.ts` parses the HSL tokens out of `globals.css` and asserts
  every pair the app renders, in both themes, so `pnpm test` fails on a regression instead of someone
  remembering to measure. 29 pairs × 2 themes. A pair that legitimately needs less than 4.5:1 is added
  with the floor it does need and a reason; a row is never deleted to make the suite pass.

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

**O2 — ~~The badge audit~~ → closed 2026-08-12, nothing to change.** The ~70 badges across 33 files
got the human pass D6 asked for, and they read as state. This was always a "look at it" item rather
than a defect, so it closes with no diff — recorded here so the audit is not re-opened.

**O3 — The rest of the system.** The type scale is answered by D16, the shadow tokens by D22 and the
radius by D24. Of the four parts, two needed no work:

- **Motion — closed, nothing to do.** 26 files import `motion.ts`; the hand-written `duration-*`
  values are CSS hover transitions, which `motion.ts` does not cover — it covers Framer variants. The
  motion *rules* are already in this file: motion is spent on state the user caused, `prefers-reduced-motion`
  is not optional, and Doherty's ~400ms.
- **Surfaces — ~~real duplication, no visible problem~~ → answered by D25** on 2026-08-12, which
  corrects both halves of that claim: it was 69 surfaces rather than ~30, and it *was* visible — two
  card looks, picked by spelling rather than by meaning.
- **Radius — ~~measurably broken~~ → answered by D24** on 2026-08-12.

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

**O5 — ~~Animated icons~~ → answered by D23** on 2026-08-12: no Framer-animated icon set. Icon motion
is a CSS transition on state the user caused, and exactly two places earn it.

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
| 2026-08-11 | D19–D20 close #152 and #154: ink tokens split from surfaces, undo for the reversible |
| 2026-08-11 | D21–D22: one Italian word per catalog level; the focus ring declared once |
| 2026-08-12 | D23 closes O5 — icon motion is CSS on user-caused state. **D9 reversed**: AutoAnimate not adopted, Framer stays the only motion dependency |
