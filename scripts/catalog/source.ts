// The official catalogue, as the university's CINECA instance publishes it.
// Public, unauthenticated, no key.
//
// Composition comes from the plan endpoint, one call per course per year.
// `POST /ricercaInsegnamenti` returns every year at once and is tempting, but it
// carries only what is offered that year — a third of the plan on the health
// professions — and reading composition from it makes our catalogue look broken.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
	MandatoryIndex,
	SourceActivity,
} from "../../src/lib/catalog/sync/diff.ts";
import { pairKey } from "../../src/lib/catalog/sync/diff.ts";

const BASE = "https://unimore.coursecatalogue.cineca.it/api/v1";
const CACHE_DIR = join(process.cwd(), ".cache", "catalog");

/** The group a plan files its compulsory activities under; the rest are choices. */
const COMPULSORY_GROUP = "OO";

export type SourceCourse = {
	academicYear: string;
	/** The catalogue's own id, which the plan endpoint is addressed by. */
	id: string;
	code: string;
	name: string;
	codicione: string | null;
	cfu: number | null;
	courseType: string | null;
};

export type SourceYear = {
	academicYear: string;
	courses: SourceCourse[];
	activities: SourceActivity[];
	mandatory: MandatoryIndex;
};

function text(value: string | undefined | null): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

async function cached<T>(name: string, load: () => Promise<T>): Promise<T> {
	const file = join(CACHE_DIR, `${name}.json`);
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
	// An unrouted path falls through to the SPA and answers HTML with a 200, so
	// the status alone proves nothing.
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
				}))
			)
		)
	);
}

type RawPlan = {
	percorsi?: {
		pdsCod?: string;
		anni?: {
			anno?: number;
			insegnamenti?: {
				cod?: string;
				attivita?: {
					adCod?: string;
					des_it?: string;
					crediti?: number | null;
					tafDes_it?: string;
				}[];
			}[];
		}[];
	}[];
};

async function fetchPlan(
	year: string,
	course: SourceCourse
): Promise<{ activities: SourceActivity[]; mandatory: [string, boolean][] }> {
	let plan: RawPlan | undefined;
	try {
		const raw = (await cached(`plan-${year}-${course.id}`, () =>
			get(`corso/${year}/${course.id}`)
		)) as RawPlan | RawPlan[];
		plan = Array.isArray(raw) ? raw[0] : raw;
	} catch {
		// Not published that year: say nothing about it rather than report it gone.
		return { activities: [], mandatory: [] };
	}

	const activities: SourceActivity[] = [];
	const mandatory: [string, boolean][] = [];

	for (const path of plan?.percorsi ?? []) {
		for (const planYear of path.anni ?? []) {
			for (const group of planYear.insegnamenti ?? []) {
				for (const activity of group.attivita ?? []) {
					if (!activity.adCod) continue;
					activities.push({
						academicYear: year,
						courseCode: course.code,
						courseName: course.name,
						codicione: course.codicione,
						code: activity.adCod,
						name: activity.des_it ?? "",
						cfu: activity.crediti ?? null,
						classYear: planYear.anno ?? null,
						taf: text(activity.tafDes_it),
						ssd: null,
						evaluation: null,
						curriculum: text(path.pdsCod),
					});
					mandatory.push([
						pairKey(course.code, activity.adCod),
						group.cod === COMPULSORY_GROUP,
					]);
				}
			}
		}
	}

	return { activities, mandatory };
}

/** One academic year of the catalogue, plan by plan. */
export async function fetchYear(
	year: string,
	onProgress?: (done: number, total: number) => void
): Promise<SourceYear> {
	const courses = await fetchCourses(year);
	const activities: SourceActivity[] = [];
	const seen = new Map<string, Set<boolean>>();

	let done = 0;
	for (const course of courses) {
		if (course.id) {
			const plan = await fetchPlan(year, course);
			activities.push(...plan.activities);
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
	};
}
