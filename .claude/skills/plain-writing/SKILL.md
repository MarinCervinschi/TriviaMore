---
name: plain-writing
description: >
  Removes the stylistic tics that mark a text as AI-generated, in what the end user reads and in
  comments and documentation alike. Use it every time you produce text meant for someone other than
  the person in the chat — UI copy, labels, error messages, confirmation dialogs, empty states,
  tooltips, toasts, notifications, the /news changelog, commit messages, PR descriptions, issue
  bodies, docs/*.md, comments, TSDoc, log message templates. It applies when the text is only part
  of a larger task (you are writing code and put comments in it), and when nobody asked about style.
---

# Writing without AI tics

## Why the rules are mechanical

A language model writes in one pass, with no global re-read: it does not notice it used the same
construction three times. Post-training also rewards prose that *sounds* well written, so some
figures of speech became the default at equal content.

So you cannot judge by feel whether a text sounds generated — your default is exactly what has to be
avoided. Apply the bans below as syntactic checks, then do the pass in section 5.

## 1. Banned constructions

| # | Pattern | Do not produce | Replace with |
|---|---------|----------------|--------------|
| 1 | **The reveal**: a flat premise, then `:` or `—`, then a punchline consequence | `È il primo messaggio: spariscono anche le risposte.` | Two sentences, or an explicit clause: `Questo è il primo messaggio. Verranno eliminate anche le risposte.` |
| 2 | An aphoristic closing that restates the previous clause and adds nothing | `…un thread senza ciò che lo ha aperto non risponde a niente.` | Delete it. If it adds no fact, it does not belong. |
| 3 | `non X, ma Y` and variants (`non si tratta di X, è Y`, `not just X but Y`, `X, not Y`) | `Non è un bug, è un problema di configurazione.` | State Y alone: `È un problema di configurazione.` |
| 4 | Lexical echo used for rhythm — the same root twice in one sentence | `Rimuoverlo rimuove l'intero thread.` | Vary the word or split the sentence. |
| 5 | Tricolon: a list of three built for cadence, not because there are three | `veloce, affidabile e scalabile` | List what actually exists, with the criterion. |
| 6 | Evaluative adjectives with no number (`robusto`, `potente`, `significativo`, `seamless`) | `Un miglioramento significativo delle performance.` | The number: `Da 400 ms a 90 ms sul p95.` No number, no adjective. |
| 7 | Dropping the referent for density — subjects and objects the reader must reconstruct | `…anche la risposta che ha ricevuto.` | An explicit subject, even if longer. |
| 8 | An opening rhetorical question | `Ti sei mai chiesto perché…?` | Start from the fact. |
| 9 | A decorative metaphor for a technical mechanism | `Il thread è come una conversazione a cena…` | The mechanism. |
| 10 | A closing summary (`In sintesi`, `Il punto è che`, `In definitiva`) | — | Delete it. The text has already ended. |
| 11 | Typographic emphasis on ordinary words (scattered bold, knowing quotes) | `un approccio **davvero** diverso` | No emphasis, or emphasis on domain terms only. |

On the dash: in Italian the equivalent tic is the colon and the en dash. The ban is on the **rhetorical
move** (premise → pause → twist), not on the character. A colon that introduces a list or a value is
fine.

## 2. Positive rules

- One fact per sentence.
- An explicit subject when the antecedent is more than a sentence away.
- Concrete verbs instead of vague ones: `viene eliminato`, not `sparisce`; `restituisce`, not `gestisce`.
- Numbers instead of indefinite quantities (`3 risposte`, not `le risposte`).
- A flat, literal register on anything destructive, irreversible, or about a student's grades. Here
  liveliness is a defect.
- If a sentence can be deleted without losing a fact, delete it.

## 3. UI copy

The UI is in Italian, and **D7** in `docs/DESIGN_DECISIONS.md` already sets the bar: specific, accents
spelled properly, no unverifiable social proof, no boilerplate borrowed from products this is not.
Before handing over a string, check it carries what the user needs to decide:

- **Confirmation dialog** — what is touched, how much (the exact number), whether it is reversible,
  and what is *not* touched if that is not obvious. The button carries the verb of the action
  (`Elimina`), never `OK`. Rare and irreversible only; the frequent and reversible get undo (D20).
- **Error** — what failed, why if you know, what the user can do now. No apologies, no bare
  `Qualcosa è andato storto`. A message meant for the user must be an `AppError`, or the middleware
  replaces it.
- **Empty state** — why it is empty and the action that fills it. No jokes.
- **Success toast** — what changed and where to find it.

One object has one name across the whole app. Never a synonym for variety.

## 4. Comments and documentation in code

The rules on *whether* a comment exists and *where* it goes are in the `code-comments` skill. Here,
only how it reads: a TSDoc ends up in an editor tooltip, so rules 1–4 and 6 apply with no exceptions,
and a comment states a fact, never a moral.

Log messages are message templates for Seq (see `docs/OBSERVABILITY.md`): a fixed sentence with named
properties, no interpolation, no adjectives.

## 5. Mandatory revision pass

Before handing over, re-read the output looking for these markers. It is not optional, and it is not
skipped because the text is short.

- [ ] `:` or `—` introducing a punchline consequence → rewrite
- [ ] `non … ma` / `not just … but` / `X, not Y` → rewrite
- [ ] The same root twice within 15 words → rewrite
- [ ] The last sentence of each paragraph: does it add a fact? If not → delete
- [ ] Evaluative adjectives without a number → delete or quantify
- [ ] Lists of exactly three → check they are three by necessity
- [ ] Every pronoun and ellipsis: is the antecedent less than a sentence away? If not → make it explicit
- [ ] Singular/plural agreement on every sentence rewritten halfway (a frequent error after rewrites)

## 6. When the rules are suspended

- The user explicitly asks for a different style, or for creative prose.
- Verbatim quotations and content that must not change.

## Examples

**UI, confirmation dialog**

✗ `È il primo messaggio: spariscono anche le risposte che ha ricevuto.`
The reveal (1), a vague verb on a destructive action (2), an elided referent (7), and it says neither
how many nor whether it is reversible (3).

✓ `Questo è il primo messaggio del thread. Verranno eliminate anche le 3 risposte. L'operazione non è reversibile.`

**TSDoc**

✗
```ts
/**
 * Per course, not per class: the same class is a mark in one degree and an
 * idoneità in another, so putting it on the class would make one of them wrong.
 */
evaluation: evaluationTypeEnum(),
```
`X, not Y` (3), the reveal after the colon (1), a rationale in a contract, and two lines.

✓
```ts
// The same class can be graded in one degree and pass/fail in another.
evaluation: evaluationTypeEnum(),
```
