import {
	type FinalBonuses,
	type GradingRules,
	TOP_GRADE,
	summarise,
} from "@/lib/crm/career/engine";
import type { Career, CareerChoiceGroup, CareerExam } from "@/lib/crm/types";

export const rulesOf = ({ settings }: Career): GradingRules => ({
	honoursGrade: settings.honoursGrade,
	honoursBonus: settings.honoursBonus,
	honoursBonusCap: settings.honoursBonusCap,
	scale: 110,
});

export const bonusesOf = ({ settings }: Career): FinalBonuses => ({
	thesis: settings.thesis,
	inCorso: settings.inCorso,
	erasmus: settings.erasmus,
	other: settings.other,
});

export const summaryOf = (career: Career) =>
	summarise(career.exams, bonusesOf(career), rulesOf(career));

/** The CFU the course needs that no exam in the record covers yet: the free choices still to make. */
export function cfuToChoose(career: Career): number {
	if (!career.course.cfu) return 0;
	const held = career.exams.reduce((sum, exam) => sum + exam.cfu, 0);
	return Math.max(0, career.course.cfu - held);
}

/** The graded CFU still to take: planned or rejected exams, plus the free choices not made yet. */
export function remainingGradedCfu(career: Career): number {
	const open = career.exams
		.filter(exam => exam.graded && exam.status !== "PASSED")
		.reduce((sum, exam) => sum + exam.cfu, 0);
	return open + cfuToChoose(career);
}

const number = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });

export const formatFigure = (value: number | null) =>
	value === null ? "—" : number.format(value);

export const formatGrade = (exam: Pick<CareerExam, "grade" | "honours">) =>
	exam.honours ? `${TOP_GRADE} e lode` : String(exam.grade ?? "");

const date = new Intl.DateTimeFormat("it-IT", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

export const formatExamDate = (value: string) =>
	date.format(new Date(`${value}T00:00:00Z`));

/** "I anno scelta taf B APP APPR (fra 1 e 99 CFU)" → "TAF B"; null when the label names none. */
export function tafOf(group: CareerChoiceGroup): string | null {
	const taf = group.label?.match(/taf\s+([A-Z])/i)?.[1];
	return taf ? `TAF ${taf.toUpperCase()}` : null;
}

export function choiceLabel(group: CareerChoiceGroup): string {
	const taf = tafOf(group);
	return taf ? `A scelta, ${taf}` : "A scelta";
}

/** The lowest final grade, where the arc of a gauge starts. */
export const GRADUATION_FLOOR = 66;

export const yearLabel = (year: number | null) =>
	year === null ? "Altri esami" : `${year}° anno`;

export type ForecastSlot = {
	id: string;
	name: string;
	cfu: number;
	classYear: number | null;
	/** Stands for an exam the student has not picked from a choice group yet. */
	placeholder: boolean;
};

/** The graded exams a forecast can give a grade to: planned, rejected, and one stand-in for the CFU still to choose. */
export function forecastSlots(career: Career): ForecastSlot[] {
	const open = career.exams
		.filter(exam => exam.graded && exam.status !== "PASSED")
		.map(exam => ({
			id: exam.id,
			name: exam.name,
			cfu: exam.cfu,
			classYear: exam.classYear,
			placeholder: false,
		}));
	const toChoose = cfuToChoose(career);
	const unchosen =
		toChoose > 0
			? [
					{
						id: "to-choose",
						name: "Esami a scelta ancora da definire",
						cfu: toChoose,
						classYear: null,
						placeholder: true,
					},
				]
			: [];
	return [...open, ...unchosen];
}

/** 31 stands for 30 e lode, so a slider can reach it. */
export const HONOURS_STEP = TOP_GRADE + 1;

export const formatStep = (step: number) =>
	step === HONOURS_STEP ? "30L" : String(step);

/** The summary once every slot has the grade the forecast gives it. */
export function forecastSummary(
	career: Career,
	grades: Record<string, number>,
	bonuses: FinalBonuses = bonusesOf(career)
) {
	const ids = new Set(Object.keys(grades));
	const kept = career.exams.filter(exam => !ids.has(exam.id));
	const forecast = forecastSlots(career).map(slot => {
		const step = grades[slot.id] ?? TOP_GRADE;
		return {
			cfu: slot.cfu,
			status: "PASSED" as const,
			graded: true,
			grade: Math.min(step, TOP_GRADE),
			honours: step === HONOURS_STEP,
		};
	});
	return summarise([...kept, ...forecast], bonuses, rulesOf(career));
}

/** Both averages after each passed graded exam, in date order. */
export function averageTrend(career: Career) {
	const rules = rulesOf(career);
	const passed = career.exams
		.filter(exam => exam.status === "PASSED" && exam.graded && exam.examDate)
		.sort((a, b) => a.examDate!.localeCompare(b.examDate!));
	let weighted = 0;
	let plain = 0;
	let cfu = 0;
	return passed.map((exam, index) => {
		const grade = exam.honours ? rules.honoursGrade : exam.grade!;
		weighted += grade * exam.cfu;
		plain += grade;
		cfu += exam.cfu;
		return {
			id: exam.id,
			date: exam.examDate!,
			name: exam.name,
			cfu: exam.cfu,
			step: exam.honours ? HONOURS_STEP : exam.grade!,
			weighted: Math.round((weighted / cfu) * 100) / 100,
			arithmetic: Math.round((plain / (index + 1)) * 100) / 100,
		};
	});
}

/** How many passed exams got each grade, lowest first; 30 e lode is its own bar. */
export function gradeCounts(career: Career) {
	const counts = new Map<number, number>();
	for (const exam of career.exams) {
		if (exam.status !== "PASSED" || !exam.graded || exam.grade === null) continue;
		const step = exam.honours ? HONOURS_STEP : exam.grade;
		counts.set(step, (counts.get(step) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort(([a], [b]) => a - b)
		.map(([step, count]) => ({ step, grade: formatStep(step), count }));
}

export type CfuBreakdown = {
	passed: number;
	planned: number;
	rejected: number;
	toChoose: number;
};

export function cfuBreakdown(career: Career, year?: number | null): CfuBreakdown {
	const inYear = <T extends { classYear: number | null }>(row: T) =>
		year === undefined || row.classYear === year;
	const exams = career.exams.filter(inYear);
	const sum = (status: CareerExam["status"]) =>
		exams.filter(e => e.status === status).reduce((total, e) => total + e.cfu, 0);
	return {
		passed: sum("PASSED"),
		planned: sum("PLANNED"),
		rejected: sum("REJECTED"),
		toChoose: year === undefined ? cfuToChoose(career) : 0,
	};
}

export const yearsOf = (career: Career) =>
	[
		...new Set<number | null>([
			...career.exams.map(exam => exam.classYear),
			...career.choiceGroups.map(group => group.classYear),
		]),
	].sort((a, b) => (a ?? Infinity) - (b ?? Infinity));
