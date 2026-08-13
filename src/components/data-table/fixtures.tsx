// Shared by the DataTable story and the toolbar-parts story, so the two cannot drift apart.
import { Badge } from "@/components/ui/badge";

import { createDataTableColumns } from "./features";

export type Section = {
	id: string;
	name: string;
	course: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	questions: number;
	visibility: "public" | "private";
};

export const SECTIONS: Section[] = [
	{
		id: "1",
		name: "Limiti e continuità",
		course: "Analisi Matematica I",
		difficulty: "MEDIUM",
		questions: 42,
		visibility: "public",
	},
	{
		id: "2",
		name: "Derivate",
		course: "Analisi Matematica I",
		difficulty: "EASY",
		questions: 30,
		visibility: "public",
	},
	{
		id: "3",
		name: "Integrali definiti",
		course: "Analisi Matematica I",
		difficulty: "HARD",
		questions: 18,
		visibility: "private",
	},
	{
		id: "4",
		name: "Grafi e visite",
		course: "Algoritmi",
		difficulty: "HARD",
		questions: 55,
		visibility: "public",
	},
	{
		id: "5",
		name: "Complessità computazionale",
		course: "Algoritmi",
		difficulty: "MEDIUM",
		questions: 24,
		visibility: "public",
	},
	{
		id: "6",
		name: "Normalizzazione",
		course: "Basi di Dati",
		difficulty: "EASY",
		questions: 12,
		visibility: "private",
	},
	{
		id: "7",
		name: "Transazioni e ACID",
		course: "Basi di Dati",
		difficulty: "MEDIUM",
		questions: 27,
		visibility: "public",
	},
];

export const DIFFICULTY_LABELS: Record<Section["difficulty"], string> = {
	EASY: "Facile",
	MEDIUM: "Media",
	HARD: "Difficile",
};

export const column = createDataTableColumns<Section>();

export const columns = [
	column.accessor("name", {
		header: "Sezione",
		meta: { label: "Sezione" },
		cell: ({ row }) => (
			<div>
				<span className="font-medium">{row.original.name}</span>
				<p className="text-muted-foreground text-xs">{row.original.course}</p>
			</div>
		),
	}),
	column.accessor("difficulty", {
		header: "Difficoltà",
		meta: {
			label: "Difficoltà",
			align: "center",
			facet: {
				options: [
					{ value: "EASY", label: "Facile" },
					{ value: "MEDIUM", label: "Media" },
					{ value: "HARD", label: "Difficile" },
				],
			},
		},
		filterFn: "arrHas",
		cell: ({ row }) => (
			<Badge variant="outline" className="rounded-full">
				{DIFFICULTY_LABELS[row.original.difficulty]}
			</Badge>
		),
	}),
	column.accessor("visibility", {
		header: "Visibilità",
		meta: {
			label: "Visibilità",
			align: "center",
			hideBelow: "md",
			facet: {
				options: [
					{ value: "public", label: "Pubblica" },
					{ value: "private", label: "Privata" },
				],
			},
		},
		filterFn: "arrHas",
		cell: ({ row }) => (
			<Badge
				variant={row.original.visibility === "public" ? "default" : "secondary"}
				className="rounded-full"
			>
				{row.original.visibility === "public" ? "Pubblica" : "Privata"}
			</Badge>
		),
	}),
	column.accessor("questions", {
		header: "Domande",
		meta: { label: "Domande", align: "center" },
	}),
];
