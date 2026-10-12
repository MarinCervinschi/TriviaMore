// Gives the first-year classes of two courses per department practice sections and questions, made up and the same on every run.
import { and, asc, eq, inArray } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	courseClasses,
	courses,
	departments,
	questions,
	sections,
} from "../../src/db/schema/index.ts";
import { EXAM_SIMULATION_SECTION } from "../../src/lib/catalog/constants.ts";

const COURSES_PER_DEPARTMENT = 2;
const CLASSES_PER_COURSE = 4;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

type NewQuestion = typeof questions.$inferInsert;

const SECTIONS = [
	{ name: "Introduzione", isPublic: true, count: 12 },
	{ name: "Approfondimento", isPublic: true, count: 12 },
	{ name: "Esercizi riservati", isPublic: false, count: 6 },
];

function question(
	className: string,
	section: string,
	n: number
): Omit<NewQuestion, "sectionId"> {
	const difficulty = DIFFICULTIES[n % DIFFICULTIES.length];
	if (n % 4 === 3) {
		return {
			content: `${className}, ${section}: l'affermazione di prova n. ${n + 1} è vera?`,
			questionType: "TRUE_FALSE",
			options: ["Vero", "Falso"],
			correctAnswer: [n % 2 === 0 ? "Vero" : "Falso"],
			explanation: "Domanda generata per lo staging.",
			difficulty,
		};
	}
	const options = ["A", "B", "C", "D"].map(
		letter => `Opzione ${letter} della domanda ${n + 1}`
	);
	const correct = n % 5 === 0 ? [options[0], options[2]] : [options[n % 4]];
	return {
		content: `${className}, ${section}: domanda di prova n. ${n + 1}. Quale opzione è corretta?`,
		questionType: "MULTIPLE_CHOICE",
		options,
		correctAnswer: correct,
		explanation: "Domanda generata per lo staging.",
		difficulty,
	};
}

const db = getDb();

const picked = await db
	.select({ classId: courseClasses.classId, courseId: courseClasses.courseId })
	.from(courseClasses)
	.innerJoin(courses, eq(courses.id, courseClasses.courseId))
	.innerJoin(departments, eq(departments.id, courses.departmentId))
	.where(and(eq(courseClasses.classYear, 1), eq(courseClasses.isTeaching, true)))
	.orderBy(
		asc(departments.position),
		asc(courses.position),
		asc(courses.code),
		asc(courseClasses.position),
		asc(courseClasses.code)
	);

const perDepartment = new Map<string, string[]>();
const perCourse = new Map<string, number>();
const classIds = new Set<string>();
const courseDepartment = new Map(
	(
		await db
			.select({ id: courses.id, departmentId: courses.departmentId })
			.from(courses)
	).map(row => [row.id, row.departmentId])
);
for (const row of picked) {
	const department = courseDepartment.get(row.courseId)!;
	const chosen = perDepartment.get(department) ?? [];
	if (!chosen.includes(row.courseId)) {
		if (chosen.length >= COURSES_PER_DEPARTMENT) continue;
		chosen.push(row.courseId);
		perDepartment.set(department, chosen);
	}
	const taken = perCourse.get(row.courseId) ?? 0;
	if (taken >= CLASSES_PER_COURSE) continue;
	perCourse.set(row.courseId, taken + 1);
	classIds.add(row.classId);
}

const existing = new Set(
	(
		await db
			.select({ classId: sections.classId })
			.from(sections)
			.where(inArray(sections.classId, [...classIds]))
	).map(row => row.classId)
);
const names = new Map(
	(await db.query.classes.findMany({ columns: { id: true, name: true } })).map(row => [
		row.id,
		row.name,
	])
);

let sectionCount = 0;
let questionCount = 0;
for (const classId of classIds) {
	if (existing.has(classId)) continue;
	const className = names.get(classId) ?? "Insegnamento";
	await db.transaction(async tx => {
		await tx.insert(sections).values({
			classId,
			name: EXAM_SIMULATION_SECTION,
			description: `Sezione per la simulazione d'esame della classe ${className}`,
			position: 0,
		});
		for (const [index, spec] of SECTIONS.entries()) {
			const [section] = await tx
				.insert(sections)
				.values({
					classId,
					name: spec.name,
					isPublic: spec.isPublic,
					position: index + 1,
				})
				.returning({ id: sections.id });
			await tx.insert(questions).values(
				Array.from({ length: spec.count }, (_, n) => ({
					...question(className, spec.name, n),
					sectionId: section!.id,
				}))
			);
			questionCount += spec.count;
		}
		sectionCount += SECTIONS.length + 1;
	});
}

console.log(
	`  ${classIds.size} insegnamenti, ${sectionCount} sezioni nuove, ${questionCount} domande nuove`
);
await closeDb();
