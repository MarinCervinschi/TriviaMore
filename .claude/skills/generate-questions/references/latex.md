# LaTeX / math notation

The renderer is **KaTeX** via `remark-math` + `rehype-katex`. Math is supported inside `content`, `options`, `correct_answer`, and `explanation`.

## Delimiters

- Inline math: `$...$` — e.g. `Il valore di $\sigma(x)$ è...`
- Block math: `$$...$$` on its own paragraph — for standalone equations.
- **Forbidden**: `\(...\)` and `\[...\]`. They are not enabled and will render as plain text.

Don't wrap an entire sentence in `$...$` — only the math fragments. Mix prose and math: *"La derivata $\frac{d}{dx} f(x)$ è positiva quando..."*.

## JSON escaping

Backslashes must be **doubled** inside JSON strings.

| LaTeX source | JSON string |
|---|---|
| `\sigma(x)` | `"$\\sigma(x)$"` |
| `\dfrac{1}{1+e^{-x}}` | `"$\\dfrac{1}{1+e^{-x}}$"` |
| `\mathbb{R}` | `"$\\mathbb{R}$"` |

Every `\command` becomes `\\command`. After writing the JSON, scan for any single backslash inside math zones — that's broken KaTeX.

## Match exactness for MULTIPLE_CHOICE

When a `correct_answer` entry contains LaTeX, copy the **exact same string** from `options` — do not paraphrase, simplify spacing, or swap `\frac` for `\dfrac`. Scoring is byte-for-byte. See `multiple-choice.md` for the full rule.

## Common pitfalls

- **Multi-character super/subscripts need braces**: `e^{-x}`, `f_{y_i}`. `e^-x` renders as `e⁻x` truncated.
- **Greek letters**: `\sigma`, `\alpha`, `\theta`, `\lambda`. Don't paste Unicode `σ` mid-formula — keep the math zone consistent.
- **Operators**: `\geq`, `\leq`, `\neq`, `\approx`, `\cdot`, `\times`. Plain `>=` works in text but not as a math symbol.
- **Functions/keywords**: `\max`, `\min`, `\log`, `\exp`, `\sin` — these get the upright font. Bare `max(0,x)` renders in italic and looks wrong.
- **Sets/spaces**: `\mathbb{R}`, `\mathbb{N}`, `\mathbb{Z}`. Pure letters like `R`, `N` are ambiguous.
- **Identical LaTeX between arrays**: inside `options` and `correct_answer`, the LaTeX strings must be identical — copy-paste, don't retype.
