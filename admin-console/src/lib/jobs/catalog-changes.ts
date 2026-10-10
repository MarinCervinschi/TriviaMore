import { inArray } from "drizzle-orm";

import { classes, courses } from "@/db/schema";

import type { ConsoleDb } from "~/lib/db/client";

import type { SyllabiReport } from "../../../../scripts/catalog/run-syllabi.ts";
import type { SyncReport } from "../../../../scripts/catalog/run-sync.ts";
import { changesOf, fieldsOf, section, valuesOf } from "./changes";

const COURSE_FIELDS = {
	nationalCode: "Codice nazionale",
	degreeClass: "Classe di laurea",
	teachingLanguage: "Lingua",
	restrictedAccess: "Accesso programmato",
	catalogueUrl: "Pagina del catalogo",
};

const COURSE_CLASS_FIELDS = {
	evaluation: "Valutazione",
	taf: "TAF",
	teachingPeriod: "Periodo",
	isTeaching: "Da studiare",
	catalogueUrl: "Pagina del catalogo",
};

const ADDITION_FIELDS = {
	cfu: "CFU",
	classYear: "Anno",
	mandatory: "Obbligatorio",
	evaluation: "Valutazione",
	ssd: "SSD",
	taf: "TAF",
};

const CURRICULUM_FIELDS = { code: "Codice", name: "Nome", common: "Comune" };

const PLAN_FIELDS = {
	name: "Nome",
	cfu: "CFU",
	classYear: "Anno",
	mandatory: "Obbligatorio",
	groupCode: "Gruppo",
	groupLabel: "Etichetta del gruppo",
	groupPosition: "Posizione nel gruppo",
	evaluation: "Valutazione",
	taf: "TAF",
	teachingPeriod: "Periodo",
	classId: "Insegnamento collegato",
};

async function courseCodes(db: ConsoleDb, ids: string[]) {
	if (ids.length === 0) return new Map<string, string>();
	const rows = await db
		.select({ id: courses.id, code: courses.code })
		.from(courses)
		.where(inArray(courses.id, [...new Set(ids)]));
	return new Map(rows.map(row => [row.id, row.code]));
}

/** The catalogue sync's plan as rows: what it adds, which fields it changes, what it removes. */
export async function syncChanges(db: ConsoleDb, report: SyncReport) {
	const { additions, updates, plans } = report;
	const codes = await courseCodes(db, [
		...plans.curricula.inserts.map(row => row.courseId),
		...plans.curricula.updates.map(row => row.row.courseId),
		...plans.curricula.deleted.map(row => row.courseId),
		...plans.plans.inserts.map(row => row.courseId),
		...plans.plans.updates.map(row => row.row.courseId),
		...plans.plans.deleted.map(row => row.courseId),
	]);
	const cohortOf = (row: { courseId: string; cohort: number; curriculum?: string }) =>
		[codes.get(row.courseId) ?? "?", `coorte ${row.cohort}`, row.curriculum]
			.filter(Boolean)
			.join(" · ");

	return changesOf(
		section(
			"additions",
			"Insegnamenti aggiunti",
			additions.additions.map(row => ({
				kind: "added",
				label: row.name,
				detail: `${row.courseCode} · ${row.code}${row.classId ? "" : " · nuovo"}`,
				fields: valuesOf(row, ADDITION_FIELDS, "after"),
			}))
		),
		section(
			"departments",
			"Dipartimenti",
			updates.departments.map(row => ({
				kind: "updated",
				label: row.name,
				fields: [
					{ name: "Codice del catalogo", before: row.before, after: row.catalogueCode },
				],
			}))
		),
		section(
			"courses",
			"Corsi",
			updates.courses.map(row => ({
				kind: "updated",
				label: row.code,
				fields: fieldsOf(row.before, row.set, COURSE_FIELDS),
			}))
		),
		section(
			"classes",
			"SSD degli insegnamenti",
			updates.classes.map(row => ({
				kind: "updated",
				label: row.name,
				detail: row.contested ? "valori diversi fra i corsi" : undefined,
				fields: [{ name: "SSD", before: row.before, after: row.ssd }],
			}))
		),
		section(
			"course-classes",
			"Insegnamenti nei corsi",
			updates.courseClasses.map(row => ({
				kind: "updated",
				label: row.name,
				detail: `${row.courseCode} · ${row.code}`,
				fields: fieldsOf(row.before, row.set, COURSE_CLASS_FIELDS),
			}))
		),
		section("curricula", "Curricula", [
			...plans.curricula.inserts.map(row => ({
				kind: "added" as const,
				label: row.name,
				detail: cohortOf(row),
				fields: valuesOf(row, CURRICULUM_FIELDS, "after"),
			})),
			...plans.curricula.updates.map(row => ({
				kind: "updated" as const,
				label: row.row.name,
				detail: cohortOf(row.row),
				fields: fieldsOf(row.before, row.set, CURRICULUM_FIELDS),
			})),
			...plans.curricula.deleted.map(row => ({
				kind: "removed" as const,
				label: row.name,
				detail: cohortOf(row),
				fields: valuesOf(row, CURRICULUM_FIELDS, "before"),
			})),
		]),
		section("plans", "Righe di piano", [
			...plans.plans.inserts.map(row => ({
				kind: "added" as const,
				label: row.name,
				detail: cohortOf(row),
				fields: valuesOf(row, PLAN_FIELDS, "after"),
			})),
			...plans.plans.updates.map(row => ({
				kind: "updated" as const,
				label: row.row.name,
				detail: cohortOf(row.row),
				fields: fieldsOf(row.before, row.set, PLAN_FIELDS),
			})),
			...plans.plans.deleted.map(row => ({
				kind: "removed" as const,
				label: row.name,
				detail: cohortOf(row),
				fields: valuesOf(row, PLAN_FIELDS, "before"),
			})),
		])
	);
}

const SYLLABUS_FIELDS = {
	academicYear: "Anno della scheda",
	catalogueUrl: "Pagina del catalogo",
	objectives: "Obiettivi",
	contents: "Contenuti",
	prerequisites: "Prerequisiti",
	assessment: "Verifica",
	readings: "Testi",
	teachingMethods: "Metodi didattici",
	outcomes: "Risultati attesi",
};

/** The syllabi import's plan as rows, named by class. */
export async function syllabiChanges(db: ConsoleDb, report: SyllabiReport) {
	const { plan } = report;
	const ids = [
		...plan.inserts.map(row => row.classId),
		...plan.updates.map(row => row.classId),
		...plan.descriptions.map(row => row.classId),
	];
	const names =
		ids.length === 0
			? new Map<string, string>()
			: new Map(
					(
						await db
							.select({ id: classes.id, name: classes.name })
							.from(classes)
							.where(inArray(classes.id, [...new Set(ids)]))
					).map(row => [row.id, row.name])
				);
	const nameOf = (id: string) => names.get(id) ?? id;

	return changesOf(
		section("syllabi", "Schede insegnamento", [
			...plan.inserts.map(row => ({
				kind: "added" as const,
				label: nameOf(row.classId),
				fields: valuesOf(row, SYLLABUS_FIELDS, "after"),
			})),
			...plan.updates.map(row => ({
				kind: "updated" as const,
				label: nameOf(row.classId),
				fields: fieldsOf(row.before, row.set, SYLLABUS_FIELDS),
			})),
		]),
		section(
			"descriptions",
			"Descrizioni",
			plan.descriptions.map(row => ({
				kind: row.description === null ? ("removed" as const) : ("updated" as const),
				label: nameOf(row.classId),
				fields: [{ name: "Descrizione", before: row.before, after: row.description }],
			}))
		)
	);
}
