import { normaliseCatalogueCode } from "../codes";
import { type MandatoryIndex, type SourceActivity, pairKey } from "./diff";
import {
	type Evaluation,
	type SourceAttributes,
	classifyTeaching,
	consensus,
	latest,
	mapEvaluation,
} from "./plan";

const MINOR_WORDS = new Set([
	"a",
	"ad",
	"agli",
	"ai",
	"al",
	"alla",
	"alle",
	"allo",
	"con",
	"da",
	"dai",
	"dal",
	"dalla",
	"dalle",
	"degli",
	"dei",
	"del",
	"della",
	"delle",
	"dello",
	"di",
	"e",
	"ed",
	"fra",
	"gli",
	"il",
	"in",
	"la",
	"le",
	"lo",
	"nei",
	"nel",
	"nella",
	"nelle",
	"o",
	"per",
	"su",
	"sul",
	"sulla",
	"tra",
	"un",
	"una",
	"uno",
	"and",
	"for",
	"of",
	"on",
	"the",
	"to",
	"with",
]);

const ELIDED_PREFIX = /^(dell|nell|all|dall|sull|quell|l|d|un)'(.+)$/;

function capitalise(word: string): string {
	return word.replace(
		/(^|[-/(])(\p{L})/gu,
		(_, separator: string, letter: string) => separator + letter.toUpperCase()
	);
}

/** The catalogue's upper-case names in the title case our classes use, minor words lowercase. */
export function toCatalogueTitle(name: string): string {
	const words = name.trim().toLowerCase().split(/\s+/);
	return words
		.map((word, index) => {
			const last = index === words.length - 1;
			if (/^[ivx]+$/.test(word) && (word !== "i" || last)) return word.toUpperCase();
			if (index > 0 && MINOR_WORDS.has(word)) return word;
			const elided = ELIDED_PREFIX.exec(word);
			if (elided) {
				const prefix = index === 0 ? capitalise(elided[1]!) : elided[1]!;
				return `${prefix}'${capitalise(elided[2]!)}`;
			}
			return capitalise(word);
		})
		.join(" ");
}

export type CatalogueAddition = {
	courseId: string;
	courseCode: string;
	code: string;
	/** An existing class to link, or `null` to create the one keyed by `code`. */
	classId: string | null;
	name: string;
	cfu: number | null;
	ssd: string | null;
	classYear: number;
	mandatory: boolean;
	evaluation: Evaluation;
	taf: string | null;
	teachingPeriod: string | null;
	isTeaching: boolean;
};

export type CatalogueAdditions = {
	additions: CatalogueAddition[];
	skipped: { unknownEvaluation: number; noClassYear: number; alreadyLinked: number };
};

/** The plan's classes our courses lack, with a known evaluation; never a course we do not hold. */
export function planCatalogueAdditions(
	local: {
		courses: { id: string; code: string }[];
		courseClasses: {
			courseId: string;
			classId: string;
			courseCode: string;
			code: string;
		}[];
	},
	source: {
		activities: SourceActivity[];
		mandatory: MandatoryIndex;
		attributes: Map<string, SourceAttributes[]>;
	}
): CatalogueAdditions {
	const courseIdByCode = new Map(local.courses.map(c => [c.code, c.id]));
	const held = new Set<string>();
	const linked = new Set<string>();
	const classIdsByCode = new Map<string, Set<string>>();
	for (const row of local.courseClasses) {
		const code = normaliseCatalogueCode(row.code);
		held.add(pairKey(row.courseCode, code));
		linked.add(`${row.courseId}\u0000${row.classId}`);
		const ids = classIdsByCode.get(code) ?? new Set<string>();
		ids.add(row.classId);
		classIdsByCode.set(code, ids);
	}

	const missing = new Map<string, SourceActivity[]>();
	for (const activity of source.activities) {
		if (!courseIdByCode.has(activity.courseCode)) continue;
		const k = pairKey(activity.courseCode, activity.code);
		if (held.has(k)) continue;
		const list = missing.get(k) ?? [];
		list.push(activity);
		missing.set(k, list);
	}

	const result: CatalogueAdditions = {
		additions: [],
		skipped: { unknownEvaluation: 0, noClassYear: 0, alreadyLinked: 0 },
	};

	for (const [k, activities] of missing) {
		const first = activities[0]!;
		const attributes = source.attributes.get(k) ?? [];
		const evaluation = latest(
			attributes.map(a => ({
				academicYear: a.academicYear,
				value: mapEvaluation(a.evaluation),
			}))
		).value;
		if (evaluation === null) {
			result.skipped.unknownEvaluation++;
			continue;
		}
		const classYear = consensus(activities.map(a => a.classYear)).value;
		if (classYear === null) {
			result.skipped.noClassYear++;
			continue;
		}

		const courseId = courseIdByCode.get(first.courseCode)!;
		const existing = classIdsByCode.get(first.code);
		const classId = existing?.size === 1 ? [...existing][0]! : null;
		if (classId && linked.has(`${courseId}\u0000${classId}`)) {
			result.skipped.alreadyLinked++;
			continue;
		}

		const name = toCatalogueTitle(
			consensus(activities.map(a => a.name)).value ?? first.name
		);
		result.additions.push({
			courseId,
			courseCode: first.courseCode,
			code: first.code,
			classId,
			name,
			cfu: consensus(activities.map(a => a.cfu)).value,
			ssd: latest(attributes.map(a => ({ academicYear: a.academicYear, value: a.ssd })))
				.value,
			classYear,
			mandatory: consensus(source.mandatory.get(k) ?? []).value ?? false,
			evaluation,
			taf: consensus(activities.map(a => a.taf)).value,
			teachingPeriod: consensus(activities.map(a => a.teachingPeriod)).value,
			isTeaching: classifyTeaching(name, evaluation) ?? true,
		});
	}

	result.additions.sort(
		(a, b) =>
			a.courseCode.localeCompare(b.courseCode) ||
			a.classYear - b.classYear ||
			a.name.localeCompare(b.name)
	);
	return result;
}
