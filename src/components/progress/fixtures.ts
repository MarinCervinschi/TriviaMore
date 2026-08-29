import type {
	AttemptHistoryEntry,
	DailyStudyStat,
	SectionAccuracy,
	UserMastery,
} from "@/lib/user/types";

/**
 * One coherent student, for the stories: every figure is derived from the same
 * attempts, so the headline count, the tree, the calendar and the recent list can
 * never disagree with each other. Seeded — no `Math.random`, no argless `Date`.
 */
export const TODAY = new Date("2026-04-18T12:00:00Z");
const TODAY_DAY = Math.floor(Date.parse("2026-04-18T00:00:00Z") / 86_400_000);

function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
	};
}

type Place = {
	sectionId: string;
	sectionName: string;
	classId: string;
	className: string;
	classCode: string;
	courseId: string;
	courseName: string;
	courseCode: string;
};

function place(
	sectionId: string,
	sectionName: string,
	classId: string,
	className: string,
	classCode: string,
	courseId: string,
	courseName: string,
	courseCode: string
): Place {
	return {
		sectionId,
		sectionName,
		classId,
		className,
		classCode,
		courseId,
		courseName,
		courseCode,
	};
}

const CATALOG: Place[] = [
	place(
		"s1",
		"Livello di trasporto",
		"c1",
		"Reti di Calcolatori",
		"RC",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s2",
		"Protocolli di routing",
		"c1",
		"Reti di Calcolatori",
		"RC",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s3",
		"Sicurezza di rete",
		"c1",
		"Reti di Calcolatori",
		"RC",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s4",
		"Limiti notevoli",
		"c2",
		"Analisi Matematica I",
		"AM1",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s5",
		"Integrali impropri",
		"c2",
		"Analisi Matematica I",
		"AM1",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s6",
		"Serie numeriche",
		"c2",
		"Analisi Matematica I",
		"AM1",
		"co1",
		"Ingegneria Informatica",
		"II"
	),
	place(
		"s7",
		"Reti neurali profonde",
		"c3",
		"Machine Learning",
		"ML",
		"co2",
		"Artificial Intelligence Engineering",
		"AIE"
	),
	place(
		"s8",
		"Ottimizzazione convessa",
		"c3",
		"Machine Learning",
		"ML",
		"co2",
		"Artificial Intelligence Engineering",
		"AIE"
	),
];

/** How well the student knows each section, and how fast they answer there. */
const SKILL: Record<string, { accuracy: number; seconds: number }> = {
	s1: { accuracy: 0.71, seconds: 41 },
	s2: { accuracy: 0.54, seconds: 22 },
	s3: { accuracy: 0.93, seconds: 34 },
	s4: { accuracy: 0.95, seconds: 19 },
	s5: { accuracy: 0.58, seconds: 58 },
	s6: { accuracy: 0.76, seconds: 39 },
	s7: { accuracy: 0.96, seconds: 18 },
	s8: { accuracy: 0.84, seconds: 30 },
};

const rnd = mulberry32(2026);

export const ATTEMPTS: AttemptHistoryEntry[] = [];

for (let back = 0; back < 250; back++) {
	const day = new Date((TODAY_DAY - back) * 86_400_000);
	// Bursts around the exam sessions, quiet months in between.
	const busy = [0, 1, 3, 8, 9].includes(day.getUTCMonth());
	if (rnd() > (busy ? 0.42 : 0.08)) continue;

	const sittings = 1 + Math.floor(rnd() * 2);
	for (let i = 0; i < sittings; i++) {
		const spot = CATALOG[Math.floor(rnd() * CATALOG.length)]!;
		const skill = SKILL[spot.sectionId]!;
		// The grade tracks the section's accuracy, with a couple of points of noise.
		const score = Math.max(
			12,
			Math.min(33, Math.round(skill.accuracy * 33 + (rnd() - 0.5) * 5))
		);
		const hour = 15 + Math.floor(rnd() * 8);
		ATTEMPTS.push({
			id: `a${back}-${i}`,
			quizId: null,
			score,
			timeSpent: Math.round((8 + rnd() * 14) * 60_000),
			completedAt: `${day.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:20:00Z`,
			quizMode: rnd() > 0.72 ? "EXAM_SIMULATION" : "STUDY",
			isFavorite: rnd() > 0.85,
			departmentId: "d1",
			departmentName: "Ingegneria «Enzo Ferrari»",
			departmentCode: "DIEF",
			...spot,
		});
	}
}

export const SCORES = ATTEMPTS.map(attempt => attempt.score);

/** The server aggregates per UTC day and mode; the fixture does the same. */
export const DAILY: DailyStudyStat[] = (() => {
	const byKey = new Map<string, DailyStudyStat>();
	for (const attempt of ATTEMPTS) {
		const date = attempt.completedAt.slice(0, 10);
		const mode = attempt.quizMode ?? "STUDY";
		const key = `${date}|${mode}`;
		const row = byKey.get(key) ?? {
			date,
			quizMode: mode,
			quizzes: 0,
			gradeSum: 0,
			timeSpent: 0,
			answersTotal: 0,
			answersCorrect: 0,
		};
		const answers = 10 + (attempt.score % 5);
		row.quizzes += 1;
		row.gradeSum += attempt.score;
		row.timeSpent += attempt.timeSpent ?? 0;
		row.answersTotal += answers;
		row.answersCorrect += Math.round(answers * (attempt.score / 33));
		byKey.set(key, row);
	}
	return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date));
})();

const SECTIONS: SectionAccuracy[] = CATALOG.map(spot => {
	const answered = ATTEMPTS.filter(a => a.sectionId === spot.sectionId);
	const total = answered.reduce((sum, a) => sum + 10 + (a.score % 5), 0);
	const skill = SKILL[spot.sectionId]!;
	return {
		sectionId: spot.sectionId,
		sectionName: spot.sectionName,
		courseCode: spot.courseCode,
		className: spot.className,
		path: null,
		total,
		correct: Math.round(total * skill.accuracy),
		avgSeconds: skill.seconds,
	};
}).filter(section => section.total > 0);

const ANSWERS = SECTIONS.reduce((sum, section) => sum + section.total, 0);

export const MASTERY: UserMastery = {
	totalAnswers: ANSWERS,
	avgSecondsPerQuestion: 31,
	// Easy questions carry the accuracy up, hard ones pull it down.
	byDifficulty: [
		{
			key: "EASY",
			total: Math.round(ANSWERS * 0.38),
			correct: Math.round(ANSWERS * 0.38 * 0.94),
		},
		{
			key: "MEDIUM",
			total: Math.round(ANSWERS * 0.46),
			correct: Math.round(ANSWERS * 0.46 * 0.81),
		},
		{
			key: "HARD",
			total: ANSWERS - Math.round(ANSWERS * 0.38) - Math.round(ANSWERS * 0.46),
			correct: Math.round(
				(ANSWERS - Math.round(ANSWERS * 0.38) - Math.round(ANSWERS * 0.46)) * 0.61
			),
		},
	],
	sections: SECTIONS,
	weakSections: SECTIONS.filter(s => s.correct / s.total < 0.6).slice(0, 6),
	strongSections: SECTIONS.filter(s => s.correct / s.total >= 0.75).slice(0, 6),
};
