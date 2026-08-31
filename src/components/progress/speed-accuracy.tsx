import { useMemo, useState } from "react";

import { LayersIcon } from "@solar-icons/react/linear/layers";

import { ScatterPlot } from "@/components/charts";
import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import type { SectionAccuracy } from "@/lib/user/types";

type Grouping = "section" | "class" | "course";

const GROUPINGS: ChipOption<Grouping>[] = [
	{ value: "section", label: "Per sezione" },
	{ value: "class", label: "Per insegnamento" },
	{ value: "course", label: "Per corso" },
];

type Group = {
	key: string;
	label: string;
	total: number;
	correct: number;
	time: number;
};

/**
 * Rolls the sections up to the chosen level. The time is re-weighted by answers,
 * never averaged over averages: a section with four answers must not weigh as
 * much as one with four hundred.
 */
function group(sections: SectionAccuracy[], by: Grouping): Group[] {
	const groups = new Map<string, Group>();
	for (const section of sections) {
		if (section.avgSeconds === null || section.total === 0) continue;
		const key =
			by === "section"
				? section.sectionId
				: by === "class"
					? (section.className ?? "—")
					: (section.courseCode ?? "—");
		const label =
			by === "section"
				? (section.sectionName ?? "Sezione")
				: by === "class"
					? (section.className ?? "Senza insegnamento")
					: (section.courseCode ?? "Senza corso");
		const current = groups.get(key) ?? { key, label, total: 0, correct: 0, time: 0 };
		current.total += section.total;
		current.correct += section.correct;
		current.time += section.avgSeconds * section.total;
		groups.set(key, current);
	}
	return [...groups.values()];
}

/**
 * Speed against precision, one mark per subject: the quadrants say whether a weak
 * area is weak because it is rushed or because it is hard. Sections without a
 * recorded time cannot be placed and are left out — said in the footer, not
 * silently dropped.
 */
export function SpeedAccuracy({ sections }: { sections: SectionAccuracy[] }) {
	const [by, setBy] = useState<Grouping>("section");

	const { points, guides, untimed } = useMemo(() => {
		const groups = group(sections, by);
		const answers = groups.reduce((sum, entry) => sum + entry.total, 0);
		return {
			points: groups.map(entry => ({
				key: entry.key,
				label: entry.label,
				x: entry.time / entry.total,
				y: (100 * entry.correct) / entry.total,
				weight: entry.total,
			})),
			guides: {
				// The two means, weighted by answers: the quadrants read "against your
				// own average", which is the only baseline this data can offer.
				x:
					answers === 0
						? undefined
						: groups.reduce((sum, entry) => sum + entry.time, 0) / answers,
				y:
					answers === 0
						? undefined
						: (100 * groups.reduce((sum, entry) => sum + entry.correct, 0)) / answers,
			},
			untimed: sections.filter(section => section.avgSeconds === null).length,
		};
	}, [sections, by]);

	const lowest = points.length === 0 ? 0 : Math.min(...points.map(point => point.y));
	const subject =
		by === "section" ? "sezione" : by === "class" ? "insegnamento" : "corso";

	return (
		<ScatterPlot
			title="Velocità e precisione"
			description={`Ogni punto è un ${subject}: tempo medio per domanda contro accuratezza`}
			actions={
				<SelectChip
					label="Raggruppa"
					value={by}
					onChange={setBy}
					options={GROUPINGS}
					lead={LayersIcon}
				/>
			}
			data={points}
			xLabel="Tempo per domanda"
			yLabel="Accuratezza"
			weightLabel="Risposte"
			xFormatter={seconds => `${Math.round(seconds)}s`}
			yFormatter={percent => `${Math.round(percent)}%`}
			yDomain={[Math.max(0, Math.floor((lowest - 5) / 10) * 10), 100]}
			guides={guides}
			height={300}
			emptyMessage="Nessuna sezione con un tempo registrato."
			footer={
				<p className="text-muted-foreground text-xs">
					La dimensione del punto è il numero di risposte date.
					{untimed > 0 &&
						` ${untimed} ${untimed === 1 ? "sezione è esclusa" : "sezioni sono escluse"}: nessun tempo registrato.`}
				</p>
			}
		/>
	);
}
