// Composition comes from the per-course plan, because ricercaInsegnamenti holds only what is offered in a year.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { normaliseCatalogueCode } from "../../src/lib/catalog/codes.ts";
import { COMPULSORY_GROUP } from "../../src/lib/catalog/constants.ts";
import type {
	MandatoryIndex,
	SourceActivity,
	SyllabusRef,
} from "../../src/lib/catalog/sync/diff.ts";
import { pairKey } from "../../src/lib/catalog/sync/diff.ts";
import type { RawSyllabusBlock } from "../../src/lib/catalog/sync/syllabi.ts";

const SITE = "https://unimore.coursecatalogue.cineca.it";
const BASE = `${SITE}/api/v1`;
let cacheDir = join(process.cwd(), ".cache", "catalog");

/** Points the response cache elsewhere; a job gives each run its own, so a scheduled run never reads an old response. */
export function setCacheDir(dir: string) {
	cacheDir = dir;
}

export type SourceCourse = {
	academicYear: string;
	/** The catalogue's internal id, which addresses the plan endpoint. */
	id: string;
	code: string;
	name: string;
	codicione: string | null;
	cfu: number | null;
	courseType: string | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	url: string;
};

export type SourceCurriculum = {
	courseCode: string;
	code: string;
	labels: string[];
	common: boolean;
};

export type SourceYear = {
	academicYear: string;
	courses: SourceCourse[];
	activities: SourceActivity[];
	mandatory: MandatoryIndex;
	curricula: SourceCurriculum[];
};

function text(value: string | undefined | null): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

async function cached<T>(name: string, load: () => Promise<T>): Promise<T> {
	const file = join(cacheDir, `${name}.json`);
	try {
		return JSON.parse(await readFile(file, "utf8")) as T;
	} catch {
		const fresh = await load();
		await mkdir(dirname(file), { recursive: true });
		await writeFile(file, JSON.stringify(fresh));
		return fresh;
	}
}

async function get(path: string): Promise<unknown> {
	const response = await fetch(`${BASE}/${path}`);
	const body = await response.text();
	// An unrouted path answers the SPA's HTML with a 200.
	if (body.startsWith("<")) throw new Error(`Nessun endpoint: ${path}`);
	return JSON.parse(body) as unknown;
}

export async function fetchYears(): Promise<string[]> {
	const years = (await cached("years", () => get("anni-offerta"))) as Record<
		string,
		{ value: string }
	>;
	return Object.values(years).map(year => year.value);
}

type RawGroup = { subgroups?: { cds?: { cdsSub?: RawCourse[] }[] }[] };
type RawCourse = {
	aa?: string;
	cod?: string;
	cdsCod?: string;
	des_it?: string;
	codicione?: string;
	crediti?: number | null;
	tipo_corso_cod?: string;
	classe_cod?: string;
	lingua_cod?: string;
	tipoAccesso?: string;
};

export async function fetchCourses(year: string): Promise<SourceCourse[]> {
	const groups = (await cached(`courses-${year}`, () =>
		get(`corsi?anno=${year}`)
	)) as RawGroup[];

	return groups.flatMap(group =>
		(group.subgroups ?? []).flatMap(subgroup =>
			(subgroup.cds ?? []).flatMap(cds =>
				(cds.cdsSub ?? []).map(course => ({
					academicYear: course.aa ?? year,
					id: String(course.cod ?? ""),
					code: course.cdsCod ?? "",
					name: course.des_it ?? "",
					codicione: text(course.codicione),
					cfu: course.crediti ?? null,
					courseType: text(course.tipo_corso_cod),
					degreeClass: text(course.classe_cod),
					teachingLanguage: text(course.lingua_cod),
					// `P` is accesso programmato, a capped intake.
					restrictedAccess:
						course.tipoAccesso === "P"
							? true
							: course.tipoAccesso === "L"
								? false
								: null,
					url: `${SITE}/corsi/${course.aa ?? year}/${course.cod}`,
				}))
			)
		)
	);
}

type RawPlan = {
	percorsi?: {
		pdsId?: string;
		pdsCod?: string;
		des_it?: string;
		comune?: boolean;
		anni?: {
			anno?: number;
			insegnamenti?: {
				cod?: string;
				ordine?: number;
				label_it?: string;
				attivita?: {
					cod?: string;
					adCod?: string;
					corso_cod?: string;
					corso_percorso_id?: number;
					des_it?: string;
					crediti?: number | null;
					aa?: string;
					ordinamento_aa?: number;
					tafDes_it?: string;
					periodo_didattico_it?: string;
				}[];
			}[];
		}[];
	}[];
};

function activityUrl(
	cohort: string,
	courseCode: string,
	curriculum: string | null,
	activity: { adCod?: string; aa?: string; ordinamento_aa?: number }
): string | null {
	if (!curriculum || !activity.adCod) return null;
	const query = new URLSearchParams({
		corso: courseCode,
		annoOrdinamento: String(activity.ordinamento_aa ?? cohort),
		pds: curriculum,
		coorte: cohort,
		ad: activity.adCod,
	});
	return `${SITE}/af/${activity.aa ?? cohort}?${query}`;
}

function syllabusRef(
	cohort: string,
	courseId: string,
	pathId: string | undefined,
	activity: {
		cod?: string;
		aa?: string;
		ordinamento_aa?: number;
		corso_cod?: string;
		corso_percorso_id?: number;
	}
): SyllabusRef | null {
	const curriculumId = activity.corso_percorso_id ?? pathId;
	if (!activity.cod || curriculumId === undefined) return null;
	return {
		offerYear: Number(activity.aa ?? cohort),
		activityId: activity.cod,
		ordinanceYear: activity.ordinamento_aa ?? Number(cohort),
		curriculumId: String(curriculumId),
		courseId: activity.corso_cod ?? courseId,
	};
}

async function fetchPlan(
	year: string,
	course: SourceCourse
): Promise<{
	activities: SourceActivity[];
	mandatory: [string, boolean][];
	curricula: SourceCurriculum[];
}> {
	let plan: RawPlan | undefined;
	try {
		const raw = (await cached(`plan-${year}-${course.id}`, () =>
			get(`corso/${year}/${course.id}`)
		)) as RawPlan | RawPlan[];
		plan = Array.isArray(raw) ? raw[0] : raw;
	} catch {
		// A course not published that year has no plan.
		return { activities: [], mandatory: [], curricula: [] };
	}

	const activities: SourceActivity[] = [];
	const mandatory: [string, boolean][] = [];
	const curricula = new Map<string, SourceCurriculum>();

	for (const path of plan?.percorsi ?? []) {
		const code = text(path.pdsCod);
		if (code) {
			const curriculum = curricula.get(code) ?? {
				courseCode: course.code,
				code,
				labels: [],
				common: Boolean(path.comune),
			};
			if (path.des_it) curriculum.labels.push(path.des_it);
			curricula.set(code, curriculum);
		}
		for (const planYear of path.anni ?? []) {
			for (const group of planYear.insegnamenti ?? []) {
				for (const activity of group.attivita ?? []) {
					if (!activity.adCod) continue;
					activities.push({
						academicYear: year,
						courseCode: course.code,
						courseName: course.name,
						codicione: course.codicione,
						code: normaliseCatalogueCode(activity.adCod),
						name: activity.des_it ?? "",
						cfu: activity.crediti ?? null,
						classYear: planYear.anno ?? null,
						taf: text(activity.tafDes_it),
						teachingPeriod: text(activity.periodo_didattico_it),
						ssd: null,
						evaluation: null,
						curriculum: code,
						group: text(group.cod),
						groupLabel: text(group.label_it),
						groupPosition: group.ordine ?? null,
						catalogueUrl: activityUrl(year, course.code, code, activity),
						syllabusRef: syllabusRef(year, course.id, path.pdsId, activity),
					});
					mandatory.push([
						pairKey(course.code, normaliseCatalogueCode(activity.adCod)),
						group.cod === COMPULSORY_GROUP,
					]);
				}
			}
		}
	}

	return { activities, mandatory, curricula: [...curricula.values()] };
}

export async function fetchYear(
	year: string,
	onProgress?: (done: number, total: number) => void
): Promise<SourceYear> {
	const courses = await fetchCourses(year);
	const activities: SourceActivity[] = [];
	const curricula: SourceCurriculum[] = [];
	const seen = new Map<string, Set<boolean>>();

	let done = 0;
	for (const course of courses) {
		if (course.id) {
			const plan = await fetchPlan(year, course);
			activities.push(...plan.activities);
			curricula.push(...plan.curricula);
			for (const [k, compulsory] of plan.mandatory) {
				const values = seen.get(k) ?? new Set<boolean>();
				values.add(compulsory);
				seen.set(k, values);
			}
		}
		onProgress?.(++done, courses.length);
	}

	return {
		academicYear: year,
		courses,
		activities,
		mandatory: new Map([...seen].map(([k, values]) => [k, [...values]])),
		curricula,
	};
}

export type ActivityAttributes = {
	academicYear: string;
	evaluation: string | null;
	ssd: string | null;
};

const NO_SSD = "NN";

/** `valutazione` and `ssd` per pair, read from every year because later plan years are published later. */
export async function fetchActivityAttributes(): Promise<
	Map<string, ActivityAttributes[]>
> {
	type Raw = {
		aa?: string;
		cdsCod?: string;
		adCod?: string;
		isMod?: boolean;
		valutazione_it?: string;
		ssd?: string;
	};

	const rows = await cached("attributes", async () => {
		const response = await fetch(`${BASE}/ricercaInsegnamenti`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			// The server ignores the year and returns all of them.
			body: JSON.stringify({ anno: "2025" }),
		});
		const raw = (await response.json()) as Raw[];
		return raw
			.filter(row => !row.isMod && row.cdsCod && row.adCod)
			.map(row => ({
				key: pairKey(row.cdsCod!, normaliseCatalogueCode(row.adCod!)),
				academicYear: row.aa ?? "",
				evaluation: text(row.valutazione_it),
				ssd: text(row.ssd) === NO_SSD ? null : text(row.ssd),
			}));
	});

	const index = new Map<string, ActivityAttributes[]>();
	for (const row of rows) {
		const list = index.get(row.key) ?? [];
		list.push({
			academicYear: row.academicYear,
			evaluation: row.evaluation,
			ssd: row.ssd,
		});
		index.set(row.key, list);
	}
	return index;
}

export async function fetchDepartments(): Promise<{ code: string; name: string }[]> {
	const rows = (await cached("departments", () => get("ricercaDipartimenti"))) as {
		dip_cod?: string;
		dip_des_it?: string;
	}[];
	return rows
		.filter(row => row.dip_cod && row.dip_des_it)
		.map(row => ({ code: row.dip_cod!, name: row.dip_des_it! }));
}

/** The raw syllabus blocks of an activity, or null when the catalogue has none for that offering. */
export async function fetchSyllabus(
	ref: SyllabusRef
): Promise<RawSyllabusBlock[] | null> {
	const path = [
		ref.offerYear,
		ref.activityId,
		ref.ordinanceYear,
		ref.curriculumId,
		ref.courseId,
	].join("/");
	const raw = await cached(`syllabus/${path.replaceAll("/", "-")}`, async () => {
		const response = await fetch(`${BASE}/insegnamento-offerta/${path}`);
		const body = await response.text();
		// A missing offering answers a plain-text 404.
		return body.startsWith("{")
			? (JSON.parse(body) as { testiTotali?: RawSyllabusBlock[] })
			: null;
	});
	return raw?.testiTotali ?? null;
}
