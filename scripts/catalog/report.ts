import type {
	CatalogDiff,
	Coverage,
	Finding,
	FindingKind,
} from "../../src/lib/catalog/sync/diff.ts";

const LABEL: Record<FindingKind, string> = {
	added: "Nel catalogo, non da noi",
	removed: "Da noi, non nel catalogo",
	renamed: "Rinominati",
	cfu: "CFU diversi",
	classYear: "Anno diverso",
	mandatory: "Obbligatorietà diversa",
};

const ORDER: FindingKind[] = [
	"removed",
	"added",
	"renamed",
	"cfu",
	"classYear",
	"mandatory",
];

const show = (value: unknown) =>
	value === null || value === undefined || value === "" ? "—" : String(value);

function escape(value: string): string {
	return value.replace(/\|/g, "\\|");
}

function table(findings: Finding[], limit: number): string[] {
	const lines = [
		"| Corso | Codice | Insegnamento | Nostro | Catalogo |",
		"|---|---|---|---|---|",
	];
	for (const finding of findings.slice(0, limit)) {
		lines.push(
			`| ${escape(finding.courseCode)} | \`${escape(finding.code)}\` | ${escape(finding.name)} | ${escape(show(finding.ours))} | ${escape(show(finding.theirs))} |`
		);
	}
	if (findings.length > limit) {
		lines.push(`\n_…e altre ${findings.length - limit}._`);
	}
	return lines;
}

/** Coverage against every published year. */
export function renderCoverage(coverage: Coverage, total: number): string {
	const pct = (n: number) => (total ? `${((100 * n) / total).toFixed(1)}%` : "—");
	return [
		`**${coverage.known} righe su ${total}** (${pct(coverage.known)}) il catalogo le conosce in almeno un anno.`,
		`**${coverage.unknown.length}** (${pct(coverage.unknown.length)}) non compaiono in nessun anno pubblicato.`,
		"",
		"Quando il confronto copre più anni la distribuzione si sovrappone — una riga",
		"può stare nel piano di due anni — quindi non è una percentuale di correttezza:",
		"",
		"| Anno | Nostre righe che quell'anno contiene |",
		"|---|---:|",
		...coverage.byYear.map(
			year => `| ${year.academicYear} | ${year.matched} (${pct(year.matched)}) |`
		),
	].join("\n");
}

/** Drift against each year on its own. */
export function renderSummary(diffs: CatalogDiff[]): string {
	const lines = [
		"| Anno | Coppie in catalogo | Agganciate | Solo da noi | Solo in catalogo | Campi diversi |",
		"|---|---:|---:|---:|---:|---:|",
	];
	for (const { summary } of diffs) {
		lines.push(
			`| ${summary.academicYear} | ${summary.sourcePairs} | ${summary.matched} | ${summary.removed} | ${summary.added} | ${summary.changed} |`
		);
	}
	return lines.join("\n");
}

export function renderReport(
	diffs: CatalogDiff[],
	cover: Coverage,
	localRows: number,
	detailFor: string,
	limit: number
) {
	const lines = [
		"# Catalogo — differenze con la sorgente ufficiale",
		"",
		`Generato il ${new Date().toISOString().slice(0, 10)} da \`pnpm catalog:diff\`.`,
		"",
		"Il confronto aggancia le righe su `(codice corso, codice insegnamento)`, che",
		"sono i codici CINECA che il nostro catalogo ha già. Nessun dato personale è",
		"stato letto: il blocco docenti viene scartato dove il payload è letto.",
		"",
		"## Quanto del nostro catalogo esiste ancora",
		"",
		renderCoverage(cover, localRows),
		"",
		"## La deriva contro un singolo anno",
		"",
		renderSummary(diffs),
		"",
	];

	const detail = diffs.find(diff => diff.summary.academicYear === detailFor);
	if (detail) {
		lines.push(`## Dettaglio ${detailFor}`, "");
		for (const kind of ORDER) {
			const findings = detail.findings.filter(finding => finding.kind === kind);
			if (findings.length === 0) continue;
			lines.push(`### ${LABEL[kind]} — ${findings.length}`, "");
			lines.push(...table(findings, limit), "");
		}
		if (detail.findings.length === 0) lines.push("_Nessuna differenza._", "");
	}

	lines.push(
		"## Limiti di questa lettura",
		"",
		"- L'obbligatorietà è **derivata**: il catalogo non porta un flag, si ricava dal",
		"  fatto che l'attività sia o meno «A scelta dello studente».",
		"- Una coppia che il catalogo porta in più curricula con valori diversi non è",
		"  segnalata finché il nostro valore è uno dei suoi.",
		"- I moduli dei corsi integrati sono esclusi: condividono il codice del padre,",
		"  e il padre è la riga che uno studente sostiene.",
		"- «Solo da noi» in una riga della seconda tabella non vuol dire sparita: la",
		"  stessa riga può stare nel piano di un altro anno. La prima tabella è quella",
		"  che dice cosa non esiste più.",
		"- La composizione viene dall'endpoint del **piano**, uno per corso e per anno.",
		"  `ricercaInsegnamenti` restituisce tutto in una chiamata ma non è il piano",
		"  intero — sui corsi delle professioni sanitarie ne porta un terzo.",
		""
	);

	return lines.join("\n");
}
