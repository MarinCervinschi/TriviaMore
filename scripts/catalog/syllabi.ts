// Imports the official syllabus of every class from the catalogue and derives the descriptions from it; writes only with --apply.
//
//   pnpm catalog:syllabi            cosa cambierebbe
//   pnpm catalog:syllabi --apply    applicalo
import { eq, isNotNull } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	classSyllabi,
	classes,
	courseCurricula,
	coursePlans,
} from "../../src/db/schema/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import type { SyllabusRef } from "../../src/lib/catalog/sync/diff.ts";
import {
	type Syllabus,
	type SyllabusChanges,
	planSyllabi,
	readSyllabus,
} from "../../src/lib/catalog/sync/syllabi.ts";
import { fetchSyllabus, fetchYear, fetchYears } from "./source.ts";

const APPLY = process.argv.includes("--apply");
const FIRST_COHORT = 2021;
const CURRENT = academicYearOf(new Date());
// Most classes publish within two offerings; the cap bounds the requests for one that never does.
const MAX_TRIES = 6;

type Candidate = { ref: SyllabusRef; catalogueUrl: string | null };

async function readLocal() {
	const db = getDb();
	const [classRows, syllabusRows, planRows] = await Promise.all([
		db.select({ id: classes.id, description: classes.description }).from(classes),
		db.select().from(classSyllabi),
		db
			.select({
				classId: coursePlans.classId,
				cohort: coursePlans.cohort,
				curriculum: courseCurricula.code,
				code: coursePlans.code,
			})
			.from(coursePlans)
			.innerJoin(courseCurricula, eq(courseCurricula.id, coursePlans.curriculumId))
			.where(isNotNull(coursePlans.classId)),
	]);
	return {
		classes: classRows,
		syllabi: syllabusRows.map(({ createdAt: _c, updatedAt: _u, ...row }) => row),
		plans: planRows,
	};
}

async function readCandidates(plans: Awaited<ReturnType<typeof readLocal>>["plans"]) {
	const classOf = new Map(
		plans.map(p => [`${p.cohort}\u0000${p.curriculum}\u0000${p.code}`, p.classId!])
	);
	const years = (await fetchYears())
		.map(Number)
		.filter(year => year >= FIRST_COHORT && year <= CURRENT);

	const candidates = new Map<string, Candidate[]>();
	for (const year of years) {
		const { activities } = await fetchYear(String(year));
		for (const activity of activities) {
			const ref = activity.syllabusRef;
			if (!ref || ref.offerYear > CURRENT || !activity.curriculum) continue;
			const classId = classOf.get(
				`${year}\u0000${activity.curriculum}\u0000${activity.code}`
			);
			if (!classId) continue;
			const list = candidates.get(classId) ?? [];
			const seen = list.some(
				c =>
					c.ref.offerYear === ref.offerYear &&
					c.ref.activityId === ref.activityId &&
					c.ref.curriculumId === ref.curriculumId
			);
			if (!seen) list.push({ ref, catalogueUrl: activity.catalogueUrl });
			candidates.set(classId, list);
		}
	}
	return candidates;
}

async function readSyllabi(candidates: Map<string, Candidate[]>) {
	const found = new Map<string, Syllabus>();
	let done = 0;
	for (const [classId, list] of candidates) {
		list.sort((a, b) => b.ref.offerYear - a.ref.offerYear);
		for (const { ref, catalogueUrl } of list.slice(0, MAX_TRIES)) {
			const syllabus = readSyllabus(
				await fetchSyllabus(ref),
				ref.offerYear,
				catalogueUrl
			);
			if (syllabus) {
				found.set(classId, syllabus);
				break;
			}
		}
		if (process.stdout.isTTY)
			process.stdout.write(`\r  syllabi ${++done}/${candidates.size}`);
	}
	if (process.stdout.isTTY) process.stdout.write("\r\x1b[K");
	return found;
}

function summarise(plan: SyllabusChanges, classCount: number, found: number) {
	const cleared = plan.descriptions.filter(d => d.description === null).length;
	console.log(`  insegnamenti     ${classCount}, con un syllabus ufficiale ${found}`);
	console.log(
		`  syllabi          ${plan.inserts.length} nuovi, ${plan.updates.length} da aggiornare`
	);
	console.log(
		`  descrizioni      ${plan.descriptions.length - cleared} da riscrivere, ${cleared} da svuotare`
	);
}

const total = (plan: SyllabusChanges) =>
	plan.inserts.length + plan.updates.length + plan.descriptions.length;

async function apply(plan: SyllabusChanges) {
	await getDb().transaction(async tx => {
		for (let i = 0; i < plan.inserts.length; i += 200) {
			await tx.insert(classSyllabi).values(plan.inserts.slice(i, i + 200));
		}
		for (const row of plan.updates) {
			await tx
				.update(classSyllabi)
				.set(row.set)
				.where(eq(classSyllabi.classId, row.classId));
		}
		for (const row of plan.descriptions) {
			await tx
				.update(classes)
				.set({ description: row.description })
				.where(eq(classes.id, row.classId));
		}
	});
}

console.log("Syllabi dal catalogo ufficiale…");
const local = await readLocal();
const found = await readSyllabi(await readCandidates(local.plans));
const plan = planSyllabi(local, found);
summarise(plan, local.classes.length, found.size);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (total(plan) === 0) {
	console.log("\nGià allineato.");
} else {
	await apply(plan);
	// A re-plan after applying must be empty, or the apply missed something.
	const left = total(planSyllabi(await readLocal(), found));
	if (left > 0) {
		console.error(`\nApplicato, ma ${left} righe restano da sistemare.`);
		process.exitCode = 1;
	} else {
		console.log(
			`\nApplicato: ${total(plan)} righe. Un secondo giro non trova più niente.`
		);
	}
}

await closeDb();
