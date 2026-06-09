# SHORT_ANSWER

Despite the name, this type covers **open-ended answers**: flashcard back-of-card content, exam-style preparation answers, and (future) free-response mode. The expected answer can range from a single term to a short paragraph.

## Options

- Omit `options` entirely or set it to `null`. Never set it to `[]`.

## correct_answer

- 1–6 strings. Each is an accepted form of the answer.
- Length is **not capped** by the schema — calibrate to the question:
  - **Short**: a name, a number, a formula, a single term, an acronym.
  - **Medium**: one or two sentences explaining a concept, listing the steps of a procedure, stating a definition.
  - **Long**: a paragraph-style answer, like what you'd write in an open-question exam — definition + brief justification, or a multi-part response.
- When the answer is short and the user might type variants, list them: full form vs. abbreviation, common spellings, equivalent notations.
  - Example (short): `["O(n log n)", "O(n*log(n))", "n log n"]`
  - Example (short): `["Roma", "Roma (Italia)"]`
- When the answer is medium/long, **one well-written canonical form is usually enough**. Don't fabricate paraphrases just to fill the array — the use cases are flashcard self-review and future fuzzy/manual scoring, not literal string matching.
- Don't list trivially close strings that scoring would already accept; list only meaningfully different forms.

## Stem (`content`)

- Ask for the kind of answer you want — short or open. Match the prompt to the expected length:
  - Short: *"Qual è la complessità del MergeSort in notazione O grande?"*
  - Open: *"Definisci la funzione di attivazione sigmoide e spiega perché è usata come output binario."*, *"Descrivi i passaggi del backpropagation in una rete con un livello nascosto."*
- For open prompts, *"spiega..."* / *"definisci..."* / *"descrivi..."* are fine — they fit this type.
- Make the expected granularity explicit when it matters: *"in notazione O grande"*, *"in al massimo tre frasi"*, *"elencando i passaggi"*.

## Anti-bias note

The "longest option = correct" pattern doesn't apply here. The equivalent pitfall is **leaking the answer in the stem**: don't quote the answer's exact phrasing in the question. Phrase the prompt so the user has to recall and reconstruct, not pattern-match.

## Examples

Short answer (flashcard-style):

```json
{
  "content": "Qual è la complessità temporale del MergeSort nel caso peggiore? Rispondi in notazione O grande.",
  "question_type": "SHORT_ANSWER",
  "correct_answer": ["O(n log n)", "O(n*log(n))", "O(n log(n))"],
  "difficulty": "MEDIUM"
}
```

Open answer (exam-style):

```json
{
  "content": "Definisci la funzione sigmoide e spiega in due-tre frasi perché è una scelta naturale come output di un classificatore binario.",
  "question_type": "SHORT_ANSWER",
  "correct_answer": [
    "La sigmoide è $\\sigma(x) = \\dfrac{1}{1 + e^{-x}}$, una funzione monotona crescente che mappa $\\mathbb{R}$ in $(0, 1)$. È la scelta naturale per l'output di un classificatore binario perché il suo codominio coincide con l'intervallo di una probabilità: $\\sigma(x)$ può essere interpretato direttamente come $P(y=1 \\mid x)$. È inoltre derivabile ovunque, condizione richiesta per l'addestramento via gradient descent."
  ],
  "difficulty": "HARD"
}
```
