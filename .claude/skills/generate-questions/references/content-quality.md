# Content quality — depth & distractor relevance

Re-read this every session. These rules govern *what a question tests and how hard it is to game* — they sit on top of the schema rules in `question-format.md` and the mechanical anti-bias rules in `multiple-choice.md`. A question can be schema-valid and still be a bad question; this file is how to tell.

## The core test

A good question can only be answered by someone who has **actually studied the material**. If a person who never opened the source could answer it from general knowledge, surface cues, or process of elimination, the question is too weak — rewrite it.

This holds even for `EASY`: easy means "recall of something the material taught", not "obvious to anyone". The difficulty axis is *how much reasoning* the question demands, never *how guessable* it is.

## Don't make them trivial

- **No answer-in-the-stem.** Don't phrase the question so the correct answer is restated, defined, or strongly implied by the wording. The reader must recall and reconstruct, not pattern-match a repeated phrase.
- **No lone-on-topic answer.** If only one option actually belongs to the topic and the rest are unrelated, the question tests nothing. Every option must be a *credible* answer to *this* question.
- **No general-knowledge gimmes.** Avoid claims/answers anyone would get right without the course (e.g. "Roma è in Italia" dressed up as a domain question), unless the point is genuinely a foundational definition the material introduces.
- **Calibrate depth honestly.** `EASY` = recall a key fact that was taught. `MEDIUM` = apply, compare, or distinguish two close concepts. `HARD` = derive, reason about an edge case, or catch a subtle condition/exception. Tag by what the question actually demands, not by how it feels.

## Distractors must be in-context (MULTIPLE_CHOICE)

The single most common failure is **out-of-context options** — distractors that don't belong to the same world as the correct answer. Rules:

- **Same category.** All options must be the same *kind* of thing as the answer: same domain, same type of entity, same units, same level of abstraction. For a question about TCP flags, every option is a TCP/networking concept — never an unrelated term, never a joke, never a different topic from the syllabus.
- **Plausible to the half-learned.** The best distractor is something a student who studied *but didn't fully master* the topic would seriously consider: an adjacent concept, a common confusion, a near-miss (off by a sign, a constant, a quantifier, a condition, a direction of causality). See "trick distractors" in `multiple-choice.md`.
- **No absurd / filler / joke options.** If a distractor is there only to fill the count and no one would ever pick it, it's dead weight that narrows the real choice. Replace it or drop the option count.
- **No throwaway "none/all of the above"** used as filler. Only use such an option if it is itself a genuine, defensible answer the reader must evaluate.
- **Mutually exclusive.** In a single-answer question, no two options may both be defensibly correct. If a distractor is arguably also right, either fix it or make the question multi-correct (and signal it — see `multiple-choice.md`).
- **No elimination by surface cues.** A reader who didn't study must not be able to discard distractors by length, grammar, oddness, or formatting. (Mechanics: anti-bias section of `multiple-choice.md`.)

## TRUE_FALSE

- Avoid trivially obvious truths and absurd falsehoods. The valuable space is **plausible-but-wrong claims** and **counter-intuitive truths**.
- For `MEDIUM`/`HARD`, flip exactly one quantifier, condition, constant, or direction — a claim that's wrong in a way a half-learned student wouldn't catch. (See `true-false.md`.)

## SHORT_ANSWER

- The pitfall is **leaking the answer in the stem**: don't quote the answer's phrasing in the question. Force recall, not copy.
- Don't ask something answerable without the material. The expected answer should be a fact, definition, or reasoning the source actually teaches.

## Quick self-check before finalizing

For each question, ask:
1. Could someone answer this *without* studying the material? → too easy, rewrite.
2. (MC) Are all distractors the same kind of thing as the answer, and would a partially-prepared student plausibly pick at least one? → if not, fix the distractors.
3. Is the correct answer findable by elimination, length, grammar, or because it's the only on-topic option? → if yes, rebalance.
4. Is the answer restated or strongly implied in the stem? → if yes, rephrase.
5. Does the `difficulty` tag match the reasoning actually required? → retag if not.

The reviewer agent (see the skill's review step) checks exactly these. Passing the self-check first means fewer revision rounds.
