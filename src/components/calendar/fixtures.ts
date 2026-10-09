import type { CalendarEntry, Importance } from "./calendar-model";

const sitting = (
	id: string,
	date: string,
	title: string,
	level: Importance,
	primary: boolean,
	detail?: string,
	done = false
): CalendarEntry => ({
	id: `sitting:${id}`,
	kind: "sitting",
	date,
	title,
	level,
	primary,
	detail,
	done,
});

/** A second-year student in the winter session: appelli with alternatives, a few events, some tasks. */
export const ENTRIES: CalendarEntry[] = [
	sitting("s1", "2027-01-14", "Ai for Bioinformatics", 3, true, "Scritto"),
	sitting("s2", "2027-02-04", "Ai for Bioinformatics", 3, false, "Scritto"),
	sitting("s3", "2027-01-20", "Smart Robotics", 2, false, "Scritto"),
	sitting("s4", "2027-02-10", "Smart Robotics", 2, true, "Scritto"),
	sitting("s5", "2027-02-17", "Smart Robotics", 2, false, "Orale"),
	sitting("s6", "2027-01-20", "Scalable ai", 1, true),
	sitting(
		"s7",
		"2027-01-27",
		"Metodi Matematici per il Machine Learning",
		3,
		false,
		"Recupero"
	),
	sitting("s9", "2026-12-15", "Big Data Management", 2, true, "Prova intermedia", true),
	{
		id: "event:e1",
		kind: "event",
		date: "2027-01-13",
		time: "10:30",
		endTime: "11:30",
		title: "Ricevimento",
		detail: "Prof. Rossi, studio 2.14",
	},
	{
		id: "event:e2",
		kind: "event",
		date: "2027-01-20",
		time: "15:00",
		endTime: "17:00",
		title: "Gruppo di studio",
	},
	{
		id: "event:e3",
		kind: "event",
		date: "2027-01-25",
		title: "Consegna progetto Robotics",
	},
	{
		id: "event:e4",
		kind: "event",
		date: "2027-01-18",
		endDate: "2027-01-22",
		title: "Settimana di laboratorio",
	},
	{
		id: "event:e5",
		kind: "event",
		date: "2027-01-11",
		time: "14:00",
		endTime: "16:00",
		title: "Lezione di Smart Robotics",
		recurrence: "FREQ=WEEKLY;BYDAY=MO,TH",
	},
	{
		id: "task:p1",
		kind: "task",
		date: "2027-01-11",
		title: "Bioinformatics, capitolo 1",
		done: true,
	},
	{
		id: "task:p2",
		kind: "task",
		date: "2027-01-12",
		time: "09:00",
		endTime: "12:00",
		title: "Bioinformatics, capitolo 2",
	},
	{
		id: "task:p3",
		kind: "task",
		date: "2027-01-13",
		title: "Bioinformatics, esercizi",
	},
];

export const TODAY = "2027-01-12";

export const TODAY_DATE = new Date(2027, 0, 12);

export const OPEN_EXAMS = [
	{ id: "e1", name: "Ai for Bioinformatics", cfu: 9 },
	{ id: "e2", name: "Smart Robotics", cfu: 9 },
	{ id: "e3", name: "Scalable ai", cfu: 9 },
	{ id: "e4", name: "Metodi Matematici per il Machine Learning", cfu: 6 },
];
