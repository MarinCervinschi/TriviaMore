import type { CourseOption } from "@/components/onboarding/course-picker";
import type { PickerOption } from "@/components/onboarding/onboarding-picker";

/** Real UniMore departments, so the story shows the lengths the layout must hold. */
export const DEPARTMENTS: PickerOption[] = [
	{
		id: "demb",
		name: 'Dipartimento di Economia "Marco Biagi"',
		keywords: "DEMB",
		meta: "12 corsi",
	},
	{
		id: "dce",
		name: "Dipartimento di Comunicazione ed Economia",
		keywords: "DCE",
		meta: "6 corsi",
	},
	{
		id: "dslc",
		name: "Dipartimento di Studi Linguistici e Culturali",
		keywords: "DSLC",
		meta: "7 corsi",
	},
	{
		id: "dgiu",
		name: "Dipartimento di Giurisprudenza",
		keywords: "DGIU",
		meta: "4 corsi",
	},
	{
		id: "desu",
		name: "Dipartimento di Educazione e Scienze Umane",
		keywords: "DESU",
		meta: "8 corsi",
	},
	{
		id: "dsbmn",
		name: "Dipartimento di Scienze Biomediche, Metaboliche e Neuroscienze",
		keywords: "DSBMN",
		meta: "9 corsi",
	},
	{
		id: "dchim",
		name: "Dipartimento Chirurgico, Medico, Odontoiatrico e di Scienze Morfologiche con Interesse Trapiantologico, Oncologico e di Medicina Rigenerativa",
		keywords: "DCHIM",
		meta: "11 corsi",
	},
	{
		id: "dsmcmia",
		name: "Dipartimento di Scienze Mediche e Chirurgiche Materno-Infantili e dell'Adulto",
		keywords: "DSMCMIA",
		meta: "10 corsi",
	},
	{
		id: "dscg",
		name: "Dipartimento di Scienze Chimiche e Geologiche",
		keywords: "DSCG",
		meta: "6 corsi",
	},
	{
		id: "fim",
		name: "Dipartimento di Scienze Fisiche, Informatiche e Matematiche",
		keywords: "FIM",
		meta: "6 corsi",
	},
	{
		id: "dsv",
		name: "Dipartimento di Scienze della Vita",
		keywords: "DSV",
		meta: "8 corsi",
	},
	{
		id: "dief",
		name: 'Dipartimento di Ingegneria "Enzo Ferrari"',
		keywords: "DIEF",
		meta: "13 corsi",
	},
	{
		id: "dismi",
		name: "Dipartimento di Scienze e Metodi dell'Ingegneria",
		keywords: "DISMI",
		meta: "9 corsi",
	},
];

/** The courses of FIM, with the total CFU the picker shows as meta. */
export const FIM_COURSES: CourseOption[] = [
	{
		id: "16-311",
		name: "Fisica",
		keywords: "16-311",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "16-315",
		name: "Informatica",
		keywords: "16-315",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "16-314",
		name: "Matematica",
		keywords: "16-314",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "16-362",
		name: "Informatica",
		keywords: "16-362",
		meta: "120 CFU",
		courseType: "MASTER",
	},
	{
		id: "16-363",
		name: "Matematica",
		keywords: "16-363",
		meta: "120 CFU",
		courseType: "MASTER",
	},
	{
		id: "16-368",
		name: "Physics - Fisica",
		keywords: "16-368",
		meta: "120 CFU",
		courseType: "MASTER",
	},
];

/** DSV is one of the five departments that also runs single-cycle courses. */
export const DSV_COURSES: CourseOption[] = [
	{
		id: "dsv-1",
		name: "Scienze Biologiche",
		keywords: "16-201",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "dsv-2",
		name: "Biotecnologie",
		keywords: "16-202",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "dsv-3",
		name: "Scienze Naturali",
		keywords: "16-203",
		meta: "180 CFU",
		courseType: "BACHELOR",
	},
	{
		id: "dsv-4",
		name: "Biologia Sperimentale e Applicata",
		keywords: "16-251",
		meta: "120 CFU",
		courseType: "MASTER",
	},
	{
		id: "dsv-5",
		name: "Biotecnologie Industriali",
		keywords: "16-252",
		meta: "120 CFU",
		courseType: "MASTER",
	},
	{
		id: "dsv-6",
		name: "Farmacia",
		keywords: "16-281",
		meta: "300 CFU",
		courseType: "SINGLE_CYCLE",
	},
	{
		id: "dsv-7",
		name: "Chimica e Tecnologia Farmaceutiche",
		keywords: "16-282",
		meta: "300 CFU",
		courseType: "SINGLE_CYCLE",
	},
];

/** What a returning user's saved classes would surface, once that query exists. */
export const SUGGESTED_DEPARTMENTS: PickerOption[] = [
	DEPARTMENTS[9]!,
	DEPARTMENTS[11]!,
];

export const SUGGESTED_COURSES: CourseOption[] = [FIM_COURSES[1]!];
