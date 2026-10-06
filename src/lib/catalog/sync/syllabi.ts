export type Syllabus = {
	academicYear: number;
	catalogueUrl: string | null;
	objectives: string | null;
	contents: string | null;
	prerequisites: string | null;
	assessment: string | null;
	readings: string | null;
	teachingMethods: string | null;
	outcomes: string | null;
};

export type RawSyllabusBlock = Record<string, unknown> & {
	chiave_udCod?: string | null;
};

const TEXT_FIELDS = {
	objectives: "obiettivi_formativi",
	contents: "contenuti",
	prerequisites: "prerequisiti",
	assessment: "verifica_apprendimento",
	readings: "testi",
	teachingMethods: "metodi_didattici_est",
	outcomes: "altro",
} as const;

const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	egrave: "è",
	eacute: "é",
	agrave: "à",
	igrave: "ì",
	ograve: "ò",
	ugrave: "ù",
};

/** Plain text from the catalogue's HTML, keeping paragraphs and list items as lines. */
export function htmlToText(value: string | null | undefined): string | null {
	if (!value) return null;
	const text = value
		.replace(/<\s*br\s*\/?>/gi, "\n")
		.replace(/<\s*li[^>]*>/gi, "\n• ")
		.replace(/<\s*\/\s*(p|div|ul|ol|h[1-6]|tr)\s*>/gi, "\n")
		.replace(/<[^>]+>/g, "")
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
			String.fromCodePoint(parseInt(code, 16))
		)
		.replace(
			/&([a-z]+);/gi,
			(match, name: string) => ENTITIES[name.toLowerCase()] ?? match
		)
		// Texts pasted from PDFs carry typographic ligatures such as ﬁ.
		.replace(/[\ufb00-\ufb06]/g, ligature => ligature.normalize("NFKC"))
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t ]+/g, " ")
		.split("\n")
		.map(line => line.trim())
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	return text === "" || text === "•" ? null : text;
}

function readBlock(
	block: RawSyllabusBlock,
	academicYear: number,
	catalogueUrl: string | null
): Syllabus | null {
	const field = (name: string) =>
		htmlToText(block[`${name}_it`] as string | undefined) ??
		htmlToText(block[`${name}_en`] as string | undefined);

	const syllabus: Syllabus = {
		academicYear,
		catalogueUrl,
		objectives: field(TEXT_FIELDS.objectives),
		contents: field(TEXT_FIELDS.contents),
		prerequisites: field(TEXT_FIELDS.prerequisites),
		assessment: field(TEXT_FIELDS.assessment),
		readings: field(TEXT_FIELDS.readings),
		teachingMethods: field(TEXT_FIELDS.teachingMethods),
		outcomes: field(TEXT_FIELDS.outcomes),
	};
	return syllabus.objectives || syllabus.contents ? syllabus : null;
}

/** The syllabus of an activity, from the block of the whole activity, else from the first of its units that has one. */
export function readSyllabus(
	blocks: RawSyllabusBlock[] | null | undefined,
	academicYear: number,
	catalogueUrl: string | null
): Syllabus | null {
	const ordered = [...(blocks ?? [])].sort(
		(a, b) => Number(Boolean(a.chiave_udCod)) - Number(Boolean(b.chiave_udCod))
	);
	for (const block of ordered) {
		const syllabus = readBlock(block, academicYear, catalogueUrl);
		if (syllabus) return syllabus;
	}
	return null;
}

const SUMMARY_MAX = 280;

/** The opening of the objectives, as the one-line description the class lists show. */
export function summarise(objectives: string | null): string | null {
	if (!objectives) return null;
	const flat = objectives.replace(/\s*\n\s*/g, " ").replace(/^•\s*/, "");
	const sentence = /^(.{40,}?[.;!?])(\s|$)/.exec(flat)?.[1];
	if (sentence && sentence.length <= SUMMARY_MAX) return sentence;
	if (flat.length <= SUMMARY_MAX) return flat;
	const cut = flat.slice(0, SUMMARY_MAX);
	return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

const SYLLABUS_FIELDS = [
	"academicYear",
	"catalogueUrl",
	"objectives",
	"contents",
	"prerequisites",
	"assessment",
	"readings",
	"teachingMethods",
	"outcomes",
] as const;

export type SyllabusChanges = {
	inserts: (Syllabus & { classId: string })[];
	updates: { classId: string; set: Partial<Syllabus> }[];
	descriptions: { classId: string; description: string | null }[];
};

/** The syllabi and descriptions to write; a class with no syllabus loses its description. */
export function planSyllabi(
	local: {
		classes: { id: string; description: string | null }[];
		syllabi: (Syllabus & { classId: string })[];
	},
	found: Map<string, Syllabus>
): SyllabusChanges {
	const stored = new Map(local.syllabi.map(s => [s.classId, s]));
	const changes: SyllabusChanges = { inserts: [], updates: [], descriptions: [] };

	for (const [classId, syllabus] of found) {
		const current = stored.get(classId);
		if (!current) {
			changes.inserts.push({ classId, ...syllabus });
			continue;
		}
		const set: Partial<Syllabus> = {};
		for (const field of SYLLABUS_FIELDS) {
			if (syllabus[field] !== current[field]) {
				(set as Record<string, unknown>)[field] = syllabus[field];
			}
		}
		if (Object.keys(set).length > 0) changes.updates.push({ classId, set });
	}

	for (const cls of local.classes) {
		const syllabus = found.get(cls.id) ?? stored.get(cls.id);
		const description = summarise(syllabus?.objectives ?? null);
		if (description !== cls.description) {
			changes.descriptions.push({ classId: cls.id, description });
		}
	}

	return changes;
}
