# Icon map — Lucide → Solar

> The one-off mapping table D11 asks for. **115 Lucide imports across 141 files** become Solar
> Linear names, verified against `@solar-icons/react@2.0.0` — every target in the table exists in
> `dist/icons/linear/`.
>
> Solar's names have no relation to Lucide's and the same word does not mean the same drawing, so
> this file is the record of *which* substitution was chosen and *why*, not a lookup you can
> regenerate. Once the sweep has landed it stops being a plan and becomes the reference for adding
> a new icon.

---

## The import contract

| | |
|---|---|
| Per icon | `import { MagnifierIcon } from "@solar-icons/react/linear/magnifier"` |
| Barrel | `import { MagnifierIcon } from "@solar-icons/react/linear"` — 1246 icons, tree-shaken in the build but paid for on every dev-server reload |
| Component type | `import type { Icon } from "@solar-icons/react/lib/types"` — replaces `LucideIcon` |

**The bare package root is not an option.** `@solar-icons/react` re-exports the **BoldDuotone**
style, so an import that forgets the `/linear` segment compiles and silently ships the wrong style.

### Four things the package does that Lucide did not

1. **`strokeWidth` already defaults to 1.5.** `IconBase` renders
   `strokeWidth="var(--solar-stroke-width, 1.5)"`, which is exactly what D11 asks for — so the prop
   goes on *no* call site. Every `strokeWidth={2}` / `{2.5}` / `{1.75}` currently written to fight
   Lucide's default of 2 is deleted rather than translated.
2. **Size defaults to `1em`, not `24`.** The width and height arrive as *presentation attributes*,
   which any CSS declaration outranks — so the existing `h-4 w-4` / `size-4` classes keep working
   untouched. Do not add a `size` prop; it writes inline `width`/`height` styles that then beat the
   class.
3. **`aria-hidden="true"` is applied automatically** unless the icon gets `alt`, `title` or
   `aria-label`. Decorative icons are therefore correct by default, and `alt="…"` renders a real
   `<title>` — which is the cheapest half of #153.
4. **A `SolarProvider` exists and we do not need it.** It only sets the same defaults through CSS
   custom properties; adding it would put a `display: contents` wrapper at the app root to configure
   values that are already the defaults.

---

## What Solar does not have

Three gaps, found by listing the package rather than by assuming. None of them is a reason to keep
two icon libraries.

### 1. There are no bare glyphs — ✕, ＋, −, ✓, ● do not exist as icons

Every one of them is only available wrapped: `close-circle`, `add-circle`, `add-square`,
`minus-circle`, `check-circle`, `check-square`. That is 30 call sites, and most of them are inside
`ui/` primitives where a circle is actively wrong — a circled tick inside a square checkbox, a
circled ✕ inside the dialog's round ghost button.

**These five marks are interface punctuation, not iconography.** They go in
`src/components/icons/glyphs.tsx`, drawn from *Solar's own paths*, lifted out of the circled
variants so the hand and the optical weight are identical:

| Glyph | Path, straight out of `linear/…` |
|---|---|
| ✕ | `M14.5 9.5L9.5 14.5M9.5 9.5L14.5 14.5` — `close-circle` |
| ＋ | `M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15` — `add-circle`, identical in `add-square` |
| − | `M15 12H9` — `minus-circle` |
| ✓ | `M8.5 12.5L10.5 14.5L15.5 9.5` — `check-circle` |
| ● | filled `r=4` circle — no Solar source, and none needed |

Same 24 viewBox, `currentColor`, round caps, stroke from the same `1.5` default. The paths are drawn
to fit inside a `r=10` circle, so as standalone marks they need scaling out to the full box — that
scaling is the only thing we are inventing.

Chevrons are **not** in this set: `alt-arrow-*` covers all four directions.

### 2. There are no brand marks — `Github` has no equivalent

Solar is a UI set; it carries no logos, and it should not. The GitHub mark goes in
`src/components/icons/github.tsx` as the official glyph, sized off the same classes. Six call sites,
all of them links to the repository.

### 3. There is no spinner — `Loader2` has no equivalent

11 call sites, every one of them `<Loader2 className="… animate-spin" />` inside a pending button.
A spinner is motion, not an icon: it becomes a `Spinner` primitive in `src/components/ui/`, which
also lets it carry `role="status"` instead of being an `aria-hidden` icon that happens to spin.

> `loading-spinner.tsx` and `loading-page.tsx` already exist and animate with Framer Motion — check
> whether the new primitive is one of them before adding a third.

---

## The table

115 imports, 114 distinct drawings — `Bookmark` and `BookmarkIcon` are the same Lucide export under
two names, and the codemod must collapse them into **one** import.

Counts are import sites, not render sites. **⚠ marks a substitution that changes the drawing
enough to need a look** before the sweep is committed; ✎ marks one that is ours to draw.

### Chevrons, arrows and direction — 32 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `ChevronDown` | 8 | `alt-arrow-down` | |
| `ChevronRight` | 8 | `alt-arrow-right` | |
| `ChevronLeft` | 3 | `alt-arrow-left` | |
| `ChevronUp` | 2 | `alt-arrow-up` | |
| `ArrowRight` | 11 | `arrow-right` | |
| `ArrowLeft` | 2 | `arrow-left` | |
| `ArrowUp` | 1 | `arrow-up` | |
| `ArrowDown` | 1 | `arrow-down` | |
| `ArrowUpRight` | 2 | `arrow-right-up` | the word order inverts — not `arrow-up-right` |
| `ArrowDownRight` | 1 | `arrow-right-down` | same inversion |
| `ArrowUpDown` | 1 | `sort-vertical` | ⚠ Solar has no double-headed arrow; this is the sort control in a column header, so the sort drawing is the better fit anyway |
| `ChevronsUpDown` | 1 | `sort-vertical` | ⚠ no stacked chevrons in Solar. Same target as above, and both are combobox/sort triggers |
| `ExternalLink` | 2 | `square-arrow-right-up` | the arrow escaping a square — the same idea as Lucide's |

### Interface punctuation — 30 sites

| Lucide | × | Target | Note |
|---|---|---|---|
| `Plus` | 12 | ✎ `PlusGlyph` | |
| `X` | 10 | ✎ `CloseGlyph` | |
| `Check` | 5 | ✎ `CheckGlyph` | |
| `Circle` | 2 | ✎ `DotGlyph` | the radio indicator in `radio-group` and `dropdown-menu` |
| `Minus` | 1 | ✎ `MinusGlyph` | the map's zoom-out control |
| `MoreHorizontal` | 1 | `menu-dots` | |
| `PlusCircle` | 1 | `add-circle` | the one case where the circle is wanted |

### Status and feedback — 24 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `CheckCircle` | 7 | `check-circle` | |
| `CheckCircle2` | 2 | `check-circle` | Lucide's two variants collapse onto one drawing |
| `Info` | 7 | `info-circle` | |
| `AlertTriangle` | 3 | `danger-triangle` | |
| `XCircle` | 2 | `close-circle` | |
| `AlertCircle` | 1 | `danger-circle` | |
| `HelpCircle` | 1 | `question-circle` | |
| `CircleDot` | 1 | `record-circle` | ⚠ a legend bullet on the quiz results page. Solar's drawing is a record button — two dots and a bar — not a dot in a ring |
| `Loader2` | 11 | ✎ `Spinner` | see above |

### Catalog and content — 61 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `GraduationCap` | 20 | `diploma` | the app's most-used icon |
| `BookOpen` | 17 | `book` | ⚠ Solar's `book` is a closed spine, not an open book. `book-2`, `book-minimalistic` and `notebook` are the alternatives to compare |
| `Library` | 4 | `library` | |
| `FileText` | 4 | `document-text` | |
| `FileUp` | 5 | `cloud-upload` | ⚠ Solar has `file-download` but no `file-upload`. Every site is the bulk-import / file-request form, where the cloud reads correctly |
| `Upload` | 2 | `upload-minimalistic` | |
| `Download` | 1 | `download-minimalistic` | |
| `FolderPlus` | 4 | `add-folder` | |
| `FolderOpen` | 2 | `folder-open` | |
| `Inbox` | 8 | `inbox` | |
| `FileQuestion` | 2 | `question-square` | ⚠ the admin "questions" nav item. Solar has no document-with-a-question; the square keeps it distinct from `question-circle`'s help meaning |
| `FileEdit` | 2 | `pen-new-square` | ⚠ "needs revision" — Solar has no document-with-a-pencil either |
| `Newspaper` | 1 | `feed` | |
| `PackageOpen` | 1 | `box-minimalistic` | ⚠ the browse empty state; Solar's box is closed |
| `List` | 1 | `list` | |
| `Tag` | 1 | `tag` | |

### Actions — 32 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `Pencil` | 9 | `pen-2` | ⚠ the row-action edit, paired with the bin. `pen`, `pen-2` and `pen-new-square` all read as edit and want comparing side by side at 16px |
| `Search` | 7 | `magnifier` | |
| `Trash2` | 7 | `trash-bin-minimalistic` | |
| `Flag` | 5 | `flag` | report |
| `Settings` | 5 | `settings` | |
| `Send` | 3 | `plane-2` | ⚠ Lucide's `Send` is a paper plane. Solar's `plane` family needs checking — one of the three is the paper one |
| `Bookmark` + `BookmarkIcon` | 3 + 3 | `bookmark` | **one** import, not two |
| `BookmarkCheck` | 1 | `bold/bookmark` | the saved state, expressed through the style axis rather than a second drawing — D11's import-path style selection earning its keep |
| `SlidersHorizontal` | 2 | `tuning-2` (colonne) · `filter` (filtri grafo) | ⚠ **Corrected after the browser pass.** `filters` was the first choice and it is the wrong drawing: in Solar it is three overlapping circles — the *photographic* filter, a colour mix. The two call sites also turned out to be two jobs: the table's "Colonne" button toggles column visibility, so it takes `tuning-2`, Solar's actual equivalent of horizontal sliders; the graph panel is literally labelled *Filtri*, so it takes `filter`, the funnel. No clash — the faceted filter uses `add-circle` and search uses `magnifier` |
| `Save` | 1 | `diskette` | |
| `RefreshCw` | 1 | `refresh` | |
| `RotateCcw` | 1 | `restart` | retry a quiz |
| `Maximize` | 1 | `maximize` | |
| `Locate` | 1 | `gps` | the map's "find me" |
| `Camera` | 1 | `camera` | avatar upload |
| `SearchX` | 1 | `magnifier` | ⚠ Solar has no crossed magnifier. The state is already carried by the empty-state text, so the ✕ was decoration |
| `Settings2` | 1 | `settings-minimalistic` | |
| `Infinity` | 1 | **deleted** | the tick it renders on already carries `label: "∞"` and the icon replaces it — render the character |

### Navigation and chrome — 22 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `Home` | 6 | `home` | |
| `Compass` | 3 | `compass` | browse |
| `LayoutDashboard` | 2 | `widget-2` | |
| `Network` | 2 | `structure` | the content-hierarchy nav item |
| `PanelLeft` | 2 | `sidebar-minimalistic` | |
| `PanelLeftClose` | 2 | `sidebar` | ⚠ neither Solar sidebar carries a direction, so open and closed differ only by weight of detail. If that does not read, the collapse control should use `alt-arrow-left` and drop the panel metaphor |
| `Menu` | 1 | `hamburger-menu` | |
| `Sun` | 1 | `sun-2` | theme toggle |
| `Moon` | 1 | `moon` | theme toggle |
| `Sparkles` | 10 | `stars` | ⚠ 10 sites and the app's "new / special" mark. `magic-wand` and `star-shine` are the alternatives |

### People, auth and roles — 31 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `LogOut` | 7 | `logout-3` | |
| `Eye` | 7 | `eye` | |
| `Mail` | 6 | `letter` | |
| `Shield` | 5 | `shield` | |
| `Users` | 5 | `users-group-rounded` | |
| `ShieldCheck` | 4 | `shield-check` | |
| `LogIn` | 3 | `login-3` | |
| `EyeOff` | 2 | `eye-closed` | |
| `Lock` | 1 | `lock-keyhole` | |
| `User` | 1 | `user` | |
| `UserCog` | 1 | `user-id` | ⚠ "assigned to" on an admin request. Solar has no user-with-a-cog |
| `MailCheck` | 1 | `letter-opened` | ⚠ the verify-email success state; the tick is lost |
| `ShieldHalf` | 1 | `shield-user` | ⚠ see below — the whole role set should move together |
| `Github` | 6 | ✎ `GithubIcon` | brand mark |

> **The role shields were re-cut, not translated.** `role-theme.ts` used `ShieldCheck` / `Shield` /
> `ShieldHalf` for SUPERADMIN / ADMIN / MAINTAINER — a set where only one of the three said anything.
> They now read `shield-star` / `shield-check` / `shield-user`, which orders them by rank and says
> *what* each one is. Same three call sites either way.

### Communication and notifications — 15 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `Bell` | 4 | `bell` | |
| `Megaphone` | 4 | `feed` (news) · `confetti` (changelog) | ⚠ Solar has no megaphone. The four sites are not one concept: three are the **news** nav and page, one is the **changelog** announcement. Splitting them is a fix, not a compromise — and it frees `Newspaper`'s slot. **The split is applied.** |
| `MessageSquarePlus` | 4 | `chat-round-dots` | ⚠ "new request". Solar has no chat-with-a-plus in either the square or the round family |
| `BellOff` | 2 | `bell-off` | |
| `MessageSquare` | 1 | `chat-square` | |

### Progress, data and metrics — 22 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `Trophy` | 10 | `cup-first` | |
| `Clock` | 5 | `clock-circle` | |
| `Target` | 5 | `target` | |
| `TrendingUp` | 4 | `graph-up` | |
| `Heart` | 3 | `heart` | |
| `Lightbulb` | 3 | `lightbulb-minimalistic` | |
| `Calendar` | 2 | `calendar-minimalistic` | |
| `CalendarClock` | 1 | `calendar-date` | ⚠ the clock is lost; `calendar-mark` is the alternative |
| `Award` | 1 | `medal-star` | |
| `BarChart3` | 1 | `chart-2` | |
| `Timer` | 1 | `stopwatch` | |

### Departments, places and legal — 20 sites

| Lucide | × | Solar Linear | Note |
|---|---|---|---|
| `MapPin` | 5 | `map-point` | the pin itself. `point-on-map` is a map *containing* a pin — not the same job |
| `Building2` | 4 | `buildings` | |
| `Scale` | 2 | `scale` | terms of service |
| `Cookie` | 2 | `donut-bitten` | ⚠ the weakest substitution in the table. Solar has no cookie; a bitten round biscuit is the closest shape, and it may simply read as a donut. The alternative is to drop the metaphor and give all three legal docs `document-text`, distinguished by their label |
| `Atom` | 1 | `atom` | SCIENZE |
| `Cpu` | 1 | `cpu` | TECNOLOGIA |
| `HeartPulse` | 1 | `heart-pulse` | SALUTE |
| `Leaf` | 1 | `leaf` | VITA |
| `Landmark` | 1 | `city` | ⚠ SOCIETA_CULTURA. Solar has no classical façade; `city` and `buildings-2` are the candidates, and `buildings` is taken by `Building2` above |
| `Bug` | 1 | `bug` | |
| `Construction` | 1 | `rocket` | ⚠ the coming-soon badge. Solar has neither a cone nor a wrench; `sledgehammer` is the literal option and `rocket` the one that says "soon" |

---

## The seventeen to look at before this is committed

Everything marked ⚠, ranked by how much of the app sees it:

1. **`BookOpen` → `book`** (17) — closed spine vs open book
2. **`Sparkles` → `stars`** (10)
3. **`Pencil` → `pen-2`** (9)
4. **`FileUp` → `cloud-upload`** (5)
5. **`Megaphone` → `feed` / `confetti`** (4) — and the split itself
6. **`MessageSquarePlus` → `chat-round-dots`** (4)
7. **`Send` → `plane-2`** (3)
8. **`ShieldHalf` → the whole role set** (3 call sites, 1 import)
9. **`Cookie` → `donut-bitten`** (2) — the one most likely to be rejected
10. **`FileQuestion` → `question-square`** (2)
11. **`FileEdit` → `pen-new-square`** (2)
12. **`PanelLeftClose` → `sidebar`** (2)
13. **`ArrowUpDown` / `ChevronsUpDown` → `sort-vertical`** (2)
14. **`Landmark` → `city`** (1)
15. **`Construction` → `rocket`** (1)
16. **`CircleDot` → `record-circle`** (1)
17. **`MailCheck` → `letter-opened`** (1) · **`UserCog` → `user-id`** (1) · **`SearchX` → `magnifier`** (1)

The sweep is applied with the choices above, and the alternatives sit side by side at 16/20/28px in
`Style Lab/Sostituzioni icone` — one story, no hunting through the app. Swapping any of them is a
one-line import change. **Delete that lab once the answers are recorded here.**

---

## Attribution — required, not optional

D11 already records it and it is repeated here because it ships with the icons rather than after
them: the artwork is the **Solar Icons Set by 480 Design**, **CC BY 4.0**. The npm package's MIT
licence covers the React wrappers, not the drawings. A visible credit has to land in the **same
change** that imports the first icon — the landing footer and the about page are the two candidates.
