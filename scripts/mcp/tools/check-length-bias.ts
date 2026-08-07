import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { z } from "zod";

import { correctLetters, parseAnswers, parseQuestions } from "../lib/parse-markdown.ts";
import { json } from "../lib/utils.ts";

// Above this much-longer-than-every-distractor margin, the option clearly breaks the
// ±20% length-parity target from multiple-choice.md → critical. At or below → soft warning.
const CRITICAL_MARGIN_PCT = 20;

interface OptionLen {
	letter: string;
	len: number;
	correct: boolean;
}

interface Flagged {
	n: number;
	difficulty: string | null;
	multiCorrect: boolean;
	severity: "critical" | "warning";
	correctLetters: string[];
	// For single-correct: the correct option length. For multi-correct: the shortest correct length.
	correctLen: number;
	longestDistractorLen: number;
	marginChars: number;
	marginPct: number;
	options: OptionLen[];
}

export function register(server: McpServer) {
	server.registerTool(
		"check_answer_length_bias",
		{
			title: "Check answer length bias",
			description:
				"Audit a questions.md + answers.md pair for the 'longest option is the correct one' bias that LLM-generated MULTIPLE_CHOICE questions tend to exhibit. For each MC question it measures every option's character length and flags the ones where the correct answer is longer than EVERY distractor (critical when it exceeds the longest distractor by more than 20%, the length-parity target; warning otherwise). Also reports a batch summary: how often the correct option is the longest vs. the expected-by-chance rate, and whether the batch shows a systemic bias. Read-only — measures and reports, never edits. Run it after drafting/review and before compile_questions, then fix the flagged questions (shorten the correct option or beef up distractors to comparable length) in the markdown.",
			inputSchema: {
				questionsPath: z
					.string()
					.describe("Absolute path to questions.md (stems + lettered options)."),
				answersPath: z
					.string()
					.describe("Absolute path to answers.md (correct letters per question)."),
			},
		},
		async ({ questionsPath, answersPath }) => {
			let questionsMd: string;
			let answersMd: string;
			try {
				questionsMd = readFileSync(questionsPath, "utf8");
				answersMd = readFileSync(answersPath, "utf8");
			} catch (e) {
				const error = e instanceof Error ? e.message : String(e);
				return json({ ok: false, stage: "read", error });
			}

			const questions = parseQuestions(questionsMd);
			const answers = parseAnswers(answersMd);
			if (!questions.length) {
				return json({
					ok: false,
					stage: "parse",
					errors: [
						"no questions found — expected '## Q<n>  [TYPE · DIFFICULTY]' headers in questions.md",
					],
				});
			}

			const flagged: Flagged[] = [];
			const skipped: string[] = [];
			let mcCount = 0;
			let correctIsLongestCount = 0;
			let chanceSum = 0;

			for (const q of [...questions].sort((a, b) => a.n - b.n)) {
				if (q.type !== "MULTIPLE_CHOICE") continue;
				if (q.options.length < 2) {
					skipped.push(`Q${q.n}: fewer than 2 options`);
					continue;
				}
				const answer = answers.get(q.n);
				if (!answer || !answer.correct) {
					skipped.push(`Q${q.n}: no 'correct:' entry in answers.md`);
					continue;
				}
				const letters = new Set(correctLetters(answer.correct));
				const options: OptionLen[] = q.options.map(o => ({
					letter: o.letter,
					len: o.text.length,
					correct: letters.has(o.letter),
				}));
				const correct = options.filter(o => o.correct);
				const distractors = options.filter(o => !o.correct);
				if (!correct.length || !distractors.length) {
					skipped.push(`Q${q.n}: no resolvable correct option or no distractors`);
					continue;
				}

				mcCount++;
				// Chance that one specific option is the longest among all (baseline for the summary).
				chanceSum += 100 / options.length;

				const multiCorrect = correct.length > 1;
				// Compare the WEAKEST correct option against the STRONGEST distractor: the bias holds
				// only when every correct option out-lengths every distractor.
				const minCorrectLen = Math.min(...correct.map(o => o.len));
				const longestDistractorLen = Math.max(...distractors.map(o => o.len));
				const correctIsLongest = minCorrectLen > longestDistractorLen;
				if (!correctIsLongest) continue;

				correctIsLongestCount++;
				const marginChars = minCorrectLen - longestDistractorLen;
				const marginPct = longestDistractorLen
					? Math.round((marginChars / longestDistractorLen) * 100)
					: 100;
				flagged.push({
					n: q.n,
					difficulty: q.difficulty,
					multiCorrect,
					severity: marginPct > CRITICAL_MARGIN_PCT ? "critical" : "warning",
					correctLetters: [...letters],
					correctLen: minCorrectLen,
					longestDistractorLen,
					marginChars,
					marginPct,
					options,
				});
			}

			flagged.sort((a, b) => b.marginPct - a.marginPct);
			const criticalCount = flagged.filter(f => f.severity === "critical").length;
			const warningCount = flagged.length - criticalCount;
			const correctIsLongestPct = mcCount
				? Math.round((correctIsLongestCount / mcCount) * 100)
				: 0;
			const expectedByChancePct = mcCount ? Math.round(chanceSum / mcCount) : 0;
			// Systemic when the correct option is the longest far more often than chance would predict.
			const systemicBias =
				mcCount >= 4 && correctIsLongestPct > Math.max(45, expectedByChancePct + 20);

			return json({
				ok: true,
				summary: {
					mcCount,
					correctIsLongestCount,
					correctIsLongestPct,
					expectedByChancePct,
					systemicBias,
					criticalCount,
					warningCount,
				},
				flagged,
				...(skipped.length ? { skipped } : {}),
			});
		}
	);
}
