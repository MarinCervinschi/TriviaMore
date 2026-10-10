export type ExamStatus = "PLANNED" | "PASSED" | "REJECTED";

export type CareerExam = {
	cfu: number;
	status: ExamStatus;
	/** Pass/fail activities count towards the CFU and never towards an average. */
	graded: boolean;
	/** 18 to 30; null until the exam is passed. */
	grade: number | null;
	honours: boolean;
};

/** The parts of the grading that differ between UniMore departments. */
export type GradingRules = {
	/** What a 30 e lode counts in the average. */
	honoursGrade: number;
	/** Points each honours adds to the graduation base, up to `honoursBonusCap`. */
	honoursBonus: number;
	honoursBonusCap: number;
	/** The top of the final grade. */
	scale: number;
};

export const DEFAULT_RULES: GradingRules = {
	honoursGrade: 30,
	honoursBonus: 0,
	honoursBonusCap: 0,
	scale: 110,
};

/** The points the committee adds to the base, which each department sets for itself. */
export type FinalBonuses = {
	thesis: number;
	inCorso: number;
	erasmus: number;
	other: number;
};

export const NO_BONUSES: FinalBonuses = { thesis: 0, inCorso: 0, erasmus: 0, other: 0 };

export const PASS_GRADE = 18;
export const TOP_GRADE = 30;

const PRECISION = 1e9;
const clean = (value: number) => Math.round(value * PRECISION) / PRECISION;

const isCounted = (exam: CareerExam) =>
	exam.status === "PASSED" && exam.graded && exam.grade !== null;

function valueOf(exam: CareerExam, rules: GradingRules): number {
	return exam.honours ? rules.honoursGrade : (exam.grade ?? 0);
}

function gradedTotals(exams: CareerExam[], rules: GradingRules) {
	let sum = 0;
	let cfu = 0;
	for (const exam of exams.filter(isCounted)) {
		sum += valueOf(exam, rules) * exam.cfu;
		cfu += exam.cfu;
	}
	return { sum, cfu };
}

/** The average weighted by CFU over the passed graded exams; null before the first one. */
export function weightedAverage(
	exams: CareerExam[],
	rules = DEFAULT_RULES
): number | null {
	const { sum, cfu } = gradedTotals(exams, rules);
	return cfu === 0 ? null : clean(sum / cfu);
}

export function arithmeticAverage(
	exams: CareerExam[],
	rules = DEFAULT_RULES
): number | null {
	const counted = exams.filter(isCounted);
	if (counted.length === 0) return null;
	return clean(
		counted.reduce((sum, exam) => sum + valueOf(exam, rules), 0) / counted.length
	);
}

/** The CFU of every passed activity, graded or not. */
export function earnedCfu(exams: CareerExam[]): number {
	return exams
		.filter(exam => exam.status === "PASSED")
		.reduce((sum, exam) => sum + exam.cfu, 0);
}

function honoursPoints(exams: CareerExam[], rules: GradingRules): number {
	const count = exams.filter(exam => isCounted(exam) && exam.honours).length;
	return Math.min(count * rules.honoursBonus, rules.honoursBonusCap);
}

/** `media × scale / 30`, plus the honours points the rules grant; null before the first graded exam. */
export function graduationBase(
	exams: CareerExam[],
	rules = DEFAULT_RULES
): number | null {
	const average = weightedAverage(exams, rules);
	if (average === null) return null;
	return clean((average * rules.scale) / TOP_GRADE + honoursPoints(exams, rules));
}

const bonusTotal = (bonuses: FinalBonuses) =>
	bonuses.thesis + bonuses.inCorso + bonuses.erasmus + bonuses.other;

/** The base plus the committee's points, capped at the scale and rounded to the nearest whole point. */
export function finalGrade(
	base: number,
	bonuses = NO_BONUSES,
	rules = DEFAULT_RULES
): { raw: number; rounded: number } {
	const raw = clean(Math.min(rules.scale, base + bonusTotal(bonuses)));
	return { raw, rounded: Math.min(rules.scale, Math.round(raw)) };
}

export type CareerSummary = {
	weightedAverage: number | null;
	arithmeticAverage: number | null;
	earnedCfu: number;
	base: number | null;
	/** The final grade if every remaining exam kept the current average. */
	projectedFinal: { raw: number; rounded: number } | null;
};

export function summarise(
	exams: CareerExam[],
	bonuses = NO_BONUSES,
	rules = DEFAULT_RULES
): CareerSummary {
	const base = graduationBase(exams, rules);
	return {
		weightedAverage: weightedAverage(exams, rules),
		arithmeticAverage: arithmeticAverage(exams, rules),
		earnedCfu: earnedCfu(exams),
		base,
		projectedFinal: base === null ? null : finalGrade(base, bonuses, rules),
	};
}

export type RequiredAverage =
	| { status: "reached" }
	| { status: "possible"; average: number }
	| { status: "impossible"; average: number | null };

/** The average the remaining graded CFU need for the final grade to reach `target`; `reached` when a pass is enough. */
export function requiredAverage(input: {
	exams: CareerExam[];
	remainingGradedCfu: number;
	target: number;
	bonuses?: FinalBonuses;
	rules?: GradingRules;
}): RequiredAverage {
	const { exams, remainingGradedCfu, target } = input;
	const bonuses = input.bonuses ?? NO_BONUSES;
	const rules = input.rules ?? DEFAULT_RULES;
	const { sum, cfu } = gradedTotals(exams, rules);
	const baseNeeded = target - bonusTotal(bonuses) - honoursPoints(exams, rules);
	const overallAverage = (baseNeeded * TOP_GRADE) / rules.scale;

	if (remainingGradedCfu <= 0) {
		const base = graduationBase(exams, rules);
		const reached = base !== null && finalGrade(base, bonuses, rules).raw >= target;
		return reached ? { status: "reached" } : { status: "impossible", average: null };
	}

	const average = clean(
		(overallAverage * (cfu + remainingGradedCfu) - sum) / remainingGradedCfu
	);
	const best = Math.max(TOP_GRADE, rules.honoursGrade);
	if (average <= PASS_GRADE) return { status: "reached" };
	if (average > best) return { status: "impossible", average };
	return { status: "possible", average };
}

/** The summary before and after one change to one exam, for "if I take this one at 24 instead of 27". */
export function whatIf(
	exams: CareerExam[],
	index: number,
	change: Partial<CareerExam>,
	bonuses = NO_BONUSES,
	rules = DEFAULT_RULES
): { before: CareerSummary; after: CareerSummary } {
	const changed = exams.map((exam, i) => (i === index ? { ...exam, ...change } : exam));
	return {
		before: summarise(exams, bonuses, rules),
		after: summarise(changed, bonuses, rules),
	};
}
