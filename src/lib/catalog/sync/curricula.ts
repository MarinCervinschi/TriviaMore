const COMMON_NAME = "Percorso comune";
const GENERAL_NAME = "Generale";

const NOISE = [
	/schema\s+automatico\s+per\s+(il\s+)?pds\s*:?\s*\S+/gi,
	/\bpiano\s+(automaticamente\s+approvato|da\s+approvare|in\s+valutazione|statutario|proposto)\b/gi,
	/\b(da\s+sottoporre\s+ad\s+approvazione|automaticamente\s+approvato|da\s+approvare|approvat[oa]|proposto)\b/gi,
	/\bschema(\s+di)?(\s+piano)?\b/gi,
	/\bpiano(\s+del)?\b/gi,
	/\b(LM|LT|LMG|LMCU)\b/g,
	/^\s*\d+-\d+-\d+\s+/,
];

const SEPARATOR = /\s[-–]\s|:\s|\b(?:curriculum|curr\.?|percorso)\s+/i;

function cleanLabel(label: string, courseName: string): string | null {
	let value = label;
	for (const pattern of NOISE) value = value.replace(pattern, " ");
	const parts = value
		.split(SEPARATOR)
		.map(part => part?.replace(/\s+/g, " ").replace(/^[\s\-–:]+|[\s\-–:]+$/g, ""))
		.filter((part): part is string => Boolean(part));
	const named = parts.filter(
		part => part.toLowerCase() !== courseName.trim().toLowerCase()
	);
	const last = named.at(-1);
	if (!last) return parts.length > 0 ? GENERAL_NAME : null;
	return last.charAt(0).toUpperCase() + last.slice(1);
}

/** A readable name for a curriculum from the catalogue's plan-schema labels, which carry approval states and course prefixes. */
export function curriculumName(
	labels: string[],
	courseName: string,
	code: string,
	common: boolean
): string {
	if (common) return COMMON_NAME;
	const counts = new Map<string, number>();
	for (const label of labels) {
		const name = cleanLabel(label, courseName);
		if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	const [best] = [...counts].sort(
		([a, x], [b, y]) => y - x || a.length - b.length || a.localeCompare(b)
	);
	return best?.[0] ?? code;
}
