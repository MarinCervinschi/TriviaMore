import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";
import type { ReviewVerdict } from "@/lib/quiz/results";
import type { AttemptHistory, QuizAttemptResult, QuizMode } from "@/lib/quiz/types";
import type { MasteryBreakdown } from "@/lib/user/types";

import type { TrendPoint } from "./attempt-trend-card";
import type { ReviewQuestion } from "./review-item";

/**
 * One attempt on «Alberi e grafi», 30 questions on the Standard evaluation mode:
 * 23 correct, 2 partial, 3 wrong, 2 left blank — 26.40 of 33, which reads 26.
 * Every fixture below is that same attempt, so the cards line up when they are
 * put side by side.
 */
export const STUDY_ATTEMPT = {
	score: 26.4,
	questions: 30,
	timeSpentMs: 1_300_000,
	correct: 23,
	partial: 2,
	wrong: 3,
	unanswered: 2,
};

/** The same section in a simulation with a penalty: 16.50 of 33, which reads 17. */
export const EXAM_ATTEMPT = {
	score: 16.5,
	questions: 30,
	timeSpentMs: 1_127_000,
	limitMs: 1_200_000,
	correct: 19,
	wrong: 8,
	unanswered: 3,
	earned: 20.9,
	lost: 4.4,
};

export const STUDY_DIFFICULTY: MasteryBreakdown[] = [
	{ key: "EASY", total: 12, correct: 11 },
	{ key: "MEDIUM", total: 13, correct: 9 },
	{ key: "HARD", total: 5, correct: 3 },
];

export const EXAM_DIFFICULTY: MasteryBreakdown[] = [
	{ key: "EASY", total: 11, correct: 10 },
	{ key: "MEDIUM", total: 13, correct: 7 },
	{ key: "HARD", total: 6, correct: 2 },
];

export const STUDY_TREND: TrendPoint[] = [
	{ label: "12 giu", score: 19 },
	{ label: "3 lug", score: 22 },
	{ label: "18 lug", score: 21 },
	{ label: "9 ago", score: 24 },
	{ label: "27 ago", score: 26.4 },
];

export const EXAM_TREND: TrendPoint[] = [
	{ label: "4 lug", score: 12 },
	{ label: "21 lug", score: 15 },
	{ label: "10 ago", score: 14 },
	{ label: "28 ago", score: 16.5 },
];

export function trendAverage(points: TrendPoint[]): number {
	return points.reduce((sum, point) => sum + point.score, 0) / points.length;
}

type ReviewFixture = {
	question: ReviewQuestion;
	userAnswer: string[];
	verdict: ReviewVerdict;
	scaledScore: number;
};

/** `parseOptions` uses the option text as its own id, so the answers are the texts. */
export const REVIEW_FIXTURES: ReviewFixture[] = [
	{
		question: {
			id: "q-4",
			difficulty: "MEDIUM",
			content:
				"Qual è la complessità nel caso peggiore della ricerca in un albero binario di ricerca non bilanciato?",
			options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
			correctAnswer: ["O(n)"],
			explanation:
				"Inserendo chiavi già ordinate il BST degenera in una lista: l'altezza diventa n e la ricerca deve attraversare tutti i nodi. Il caso O(log n) vale solo su un albero bilanciato, come un AVL o un red-black tree.",
		},
		userAnswer: ["O(log n)"],
		verdict: "wrong",
		scaledScore: 0,
	},
	{
		question: {
			id: "q-6",
			difficulty: "MEDIUM",
			content:
				"Quali visite di un albero binario restituiscono i nodi di un BST in ordine crescente?",
			options: [
				"Visita simmetrica (in-order)",
				"Visita anticipata (pre-order)",
				"Visita simmetrica inversa, letta al contrario",
				"Visita per livelli",
			],
			correctAnswer: [
				"Visita simmetrica (in-order)",
				"Visita simmetrica inversa, letta al contrario",
			],
			explanation: null,
		},
		userAnswer: ["Visita simmetrica (in-order)"],
		verdict: "partial",
		scaledScore: 0.55,
	},
	{
		question: {
			id: "q-9",
			difficulty: "EASY",
			content: "Quanti archi ha un albero con n nodi?",
			options: ["n", "n − 1", "n + 1", "2n"],
			correctAnswer: ["n − 1"],
			explanation:
				"Ogni nodo tranne la radice ha esattamente un arco entrante dal padre, quindi gli archi sono n − 1. È anche la proprietà che distingue un albero da un grafo connesso qualsiasi.",
		},
		userAnswer: [],
		verdict: "unanswered",
		scaledScore: 0,
	},
	{
		question: {
			id: "q-17",
			difficulty: "HARD",
			content: "Qual è l'altezza massima di un albero AVL con n nodi?",
			options: ["Θ(log n)", "Θ(n)", "Θ(√n)", "Θ(1)"],
			correctAnswer: ["Θ(log n)"],
			explanation: null,
		},
		userAnswer: ["Θ(log n)"],
		verdict: "correct",
		scaledScore: 1.1,
	},
];

const EVALUATION_STANDARD = {
	id: "standard",
	name: "Standard",
	description: null,
	correctAnswerPoints: 1,
	incorrectAnswerPoints: 0,
	partialCreditEnabled: true,
};

const EVALUATION_PENALTY = {
	...EVALUATION_STANDARD,
	id: "penalty",
	name: "Con penalità",
	incorrectAnswerPoints: -0.5,
	partialCreditEnabled: false,
};

const SECTION = {
	id: "section-alberi",
	name: "Alberi e grafi",
	classId: "class-asd",
	className: "Algoritmi e Strutture Dati",
	courseName: "Informatica",
	departmentName: "Scienze Fisiche, Informatiche e Matematiche",
	departmentCode: "FIM",
	courseCode: "INF",
	classCode: "ASD",
	path: "/browse/fim/inf/asd/alberi-e-grafi",
};

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const MAX_SCALE = 33;

/**
 * Spreads the marks through the quiz instead of leaving every wrong answer at the
 * end. `i * 7 % n` is a bijection whenever 7 and n are coprime, so the result is a
 * permutation and the counts survive it.
 */
function dealMarks(counts: {
	correct: number;
	partial: number;
	wrong: number;
	blank: number;
}): string[] {
	const marks = [
		...Array<string>(counts.correct).fill("c"),
		...Array<string>(counts.partial).fill("p"),
		...Array<string>(counts.wrong).fill("w"),
		...Array<string>(counts.blank).fill("b"),
	];
	return marks.map((_, index) => marks[(index * 7) % marks.length]!);
}

/**
 * A whole attempt, built from a fixed pattern rather than a random one: the same
 * thirty questions in the same order every time, so two stories side by side are
 * comparing the layout and not the data.
 */
function buildAttempt({
	id,
	timeSpentMs,
	timeLimit,
	quizMode,
	penalty,
	counts,
	completedAt,
	history,
	section = SECTION,
}: {
	id: string;
	timeSpentMs: number;
	timeLimit: number | null;
	quizMode: QuizMode;
	penalty: boolean;
	/** How the attempt went. The pattern and the grade both come from here, so they cannot drift apart. */
	counts: { correct: number; partial: number; wrong: number; blank: number };
	completedAt: string;
	history: AttemptHistory | null;
	/** The exam simulation runs against the per-class sentinel, not a real section. */
	section?: QuizAttemptResult["quiz"]["section"];
}): QuizAttemptResult {
	const pattern = dealMarks(counts);
	const perQuestion = MAX_SCALE / pattern.length;
	const score =
		counts.correct * perQuestion +
		counts.partial * (perQuestion / 2) +
		(penalty ? -counts.wrong * (perQuestion / 2) : 0);
	const evaluationMode = penalty ? EVALUATION_PENALTY : EVALUATION_STANDARD;
	const questions = pattern.map((_, index) => {
		const source = REVIEW_FIXTURES[index % REVIEW_FIXTURES.length]!.question;
		return {
			id: `q-${index}`,
			content: source.content,
			questionType: "MULTIPLE_CHOICE" as const,
			options: source.options,
			correctAnswer: source.correctAnswer,
			explanation: index % 3 === 0 ? source.explanation : null,
			difficulty: DIFFICULTIES[index % 3]!,
		};
	});

	const answers = questions.flatMap((question, index) => {
		const mark = pattern[index];
		if (mark === "b") {
			return [{ questionId: question.id, userAnswer: [], score: 0, isCorrect: false }];
		}
		const wrongOption = question.options?.find(
			option => !question.correctAnswer.includes(option)
		);
		if (mark === "c") {
			return [
				{
					questionId: question.id,
					userAnswer: question.correctAnswer,
					score: 1,
					isCorrect: true,
				},
			];
		}
		if (mark === "p") {
			// One right and one wrong, so the open row actually shows partial credit
			// rather than a pick that looks correct and is scored as if it were not.
			return [
				{
					questionId: question.id,
					userAnswer: [
						question.correctAnswer[0]!,
						...(wrongOption ? [wrongOption] : []),
					],
					score: 0.5,
					isCorrect: false,
				},
			];
		}
		return [
			{
				questionId: question.id,
				userAnswer: wrongOption ? [wrongOption] : [],
				score: penalty ? -0.5 : 0,
				isCorrect: false,
			},
		];
	});

	return {
		id,
		score,
		timeSpent: timeSpentMs,
		completedAt,
		isFavorite: false,
		quiz: {
			id: `quiz-${id}`,
			quizMode,
			timeLimit,
			section,
			evaluationMode,
			questions,
		},
		answers,
		history,
	};
}

export const STUDY_RESULT = buildAttempt({
	id: "attempt-study",
	timeSpentMs: STUDY_ATTEMPT.timeSpentMs,
	timeLimit: null,
	quizMode: "STUDY",
	penalty: false,
	counts: { correct: 23, partial: 2, wrong: 3, blank: 2 },
	completedAt: "2026-08-27T18:42:00.000Z",
	history: {
		points: STUDY_TREND.map((point, index) => ({
			attemptId: `a-${index}`,
			score: point.score,
			completedAt: [
				"2026-06-12T10:00:00.000Z",
				"2026-07-03T10:00:00.000Z",
				"2026-07-18T10:00:00.000Z",
				"2026-08-09T10:00:00.000Z",
				"2026-08-27T18:42:00.000Z",
			][index]!,
		})),
		average: trendAverage(STUDY_TREND),
		position: 5,
		isPersonalBest: true,
		avgSecondsPerQuestion: 51,
	},
});

export const EXAM_RESULT = buildAttempt({
	id: "attempt-exam",
	section: {
		...SECTION,
		id: "section-exam-sentinel",
		name: EXAM_SIMULATION_SECTION,
		path: "/browse/fim/inf/asd/exam-simulation",
	},
	timeSpentMs: EXAM_ATTEMPT.timeSpentMs,
	timeLimit: 20,
	quizMode: "EXAM_SIMULATION",
	penalty: true,
	counts: { correct: 19, partial: 0, wrong: 8, blank: 3 },
	completedAt: "2026-08-28T09:15:00.000Z",
	history: {
		points: EXAM_TREND.map((point, index) => ({
			attemptId: `e-${index}`,
			score: point.score,
			completedAt: [
				"2026-07-04T10:00:00.000Z",
				"2026-07-21T10:00:00.000Z",
				"2026-08-10T10:00:00.000Z",
				"2026-08-28T09:15:00.000Z",
			][index]!,
		})),
		average: trendAverage(EXAM_TREND),
		position: 4,
		isPersonalBest: true,
		avgSecondsPerQuestion: null,
	},
});
