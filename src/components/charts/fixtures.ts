/**
 * Deterministic sample data for the chart stories. No `Math.random`: a story
 * that reshuffles on every render is useless for comparing two variants.
 */

const MONTHS = ["Set", "Ott", "Nov", "Dic", "Gen", "Feb", "Mar", "Apr"];

export const monthlyActivity = MONTHS.map((mese, index) => ({
	mese,
	quiz: [12, 28, 41, 22, 57, 63, 48, 71][index],
	flashcard: [4, 9, 18, 11, 26, 31, 24, 38][index],
}));

export const gradeTrend = MONTHS.map((mese, index) => ({
	mese,
	media: [19.2, 21.4, 22.8, 21.9, 24.6, 25.1, 26.4, 27.8][index],
}));

export const sectionScores = [
	{ sezione: "Limiti e continuità", media: 27.4, migliore: 30 },
	{ sezione: "Derivate", media: 24.1, migliore: 28 },
	{ sezione: "Integrali definiti", media: 17.2, migliore: 22 },
	{ sezione: "Serie numeriche", media: 21.8, migliore: 26 },
	{ sezione: "Equazioni differenziali", media: 19.5, migliore: 24 },
];

export const departmentCourses = [
	{ dipartimento: "DIEF", corsi: 14 },
	{ dipartimento: "FIM", corsi: 11 },
	{ dipartimento: "DEMB", corsi: 9 },
	{ dipartimento: "DSMC", corsi: 6 },
	{ dipartimento: "DSV", corsi: 4 },
];

export const courseTypes = [
	{ key: "BACHELOR", label: "Triennale", value: 28 },
	{ key: "MASTER", label: "Magistrale", value: 19 },
	{ key: "SINGLE_CYCLE", label: "Ciclo unico", value: 6 },
];

export const manyDepartments = [
	{ key: "dief", label: "DIEF", value: 14 },
	{ key: "fim", label: "FIM", value: 11 },
	{ key: "demb", label: "DEMB", value: 9 },
	{ key: "dsmc", label: "DSMC", value: 6 },
	{ key: "dsv", label: "DSV", value: 4 },
	{ key: "dcm", label: "DCM", value: 3 },
	{ key: "dgs", label: "DGS", value: 2 },
];

export const quizFunnel = [
	{ key: "viste", label: "Domande viste", value: 1240 },
	{ key: "risposte", label: "Risposte date", value: 1105 },
	{ key: "corrette", label: "Risposte corrette", value: 742 },
	{ key: "ripassate", label: "Ripassate dopo errore", value: 318 },
];

export const difficultyBySection = {
	rows: ["Limiti", "Derivate", "Integrali", "Serie", "Eq. differenziali"],
	columns: ["Facile", "Media", "Difficile"],
	cells: [
		{ row: "Limiti", column: "Facile", value: 18 },
		{ row: "Limiti", column: "Media", value: 12 },
		{ row: "Limiti", column: "Difficile", value: 4 },
		{ row: "Derivate", column: "Facile", value: 9 },
		{ row: "Derivate", column: "Media", value: 21 },
		{ row: "Derivate", column: "Difficile", value: 7 },
		{ row: "Integrali", column: "Facile", value: 3 },
		{ row: "Integrali", column: "Media", value: 8 },
		{ row: "Integrali", column: "Difficile", value: 24 },
		{ row: "Serie", column: "Facile", value: 6 },
		{ row: "Serie", column: "Media", value: 14 },
		{ row: "Serie", column: "Difficile", value: 11 },
		{ row: "Eq. differenziali", column: "Facile", value: 2 },
		{ row: "Eq. differenziali", column: "Media", value: 5 },
		{ row: "Eq. differenziali", column: "Difficile", value: 16 },
	],
};

/** A year of study days, generated from a fixed seed so the grid never moves. */
export function studyYear(endDate = "2026-08-08") {
	const end = new Date(`${endDate}T00:00:00Z`);
	const days: { date: string; value: number }[] = [];
	let seed = 20260808;
	for (let offset = 364; offset >= 0; offset--) {
		const day = new Date(end.getTime() - offset * 86_400_000);
		seed = (seed * 1103515245 + 12345) % 2147483648;
		const roll = seed % 100;
		const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
		// Term-time bursts, a quiet summer, and lighter weekends.
		const month = day.getUTCMonth();
		const inTerm = month <= 5 || month >= 8;
		const chance = inTerm ? (weekend ? 35 : 70) : weekend ? 8 : 20;
		const value = roll < chance ? 1 + (seed % (inTerm ? 8 : 3)) : 0;
		days.push({ date: day.toISOString().slice(0, 10), value });
	}
	return days;
}
