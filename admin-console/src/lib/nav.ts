import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { DatabaseIcon } from "@solar-icons/react/linear/database";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { HistoryIcon } from "@solar-icons/react/linear/history";
import { Home2Icon } from "@solar-icons/react/linear/home-2";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { PlayCircleIcon } from "@solar-icons/react/linear/play-circle";
import { PlugCircleIcon } from "@solar-icons/react/linear/plug-circle";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { ShieldKeyholeIcon } from "@solar-icons/react/linear/shield-keyhole";
import { TransferHorizontalIcon } from "@solar-icons/react/linear/transfer-horizontal";
import { Widget2Icon } from "@solar-icons/react/linear/widget-2";

import type { Icon } from "@/components/icons";

export type NavItem = {
	label: string;
	to: string;
	icon: Icon;
	/** A short marker beside the label, such as a count or a status. */
	badge?: string;
};

export type NavGroup = { label: string; items: NavItem[] };

export type NavSection = {
	id: string;
	label: string;
	icon: Icon;
	/** The path every page of the section starts with. */
	base: string;
	groups: NavGroup[];
};

export const NAV: NavSection[] = [
	{
		id: "home",
		label: "Panoramica",
		icon: Home2Icon,
		base: "/",
		groups: [
			{
				label: "Panoramica",
				items: [
					{ label: "Dashboard", to: "/", icon: Widget2Icon },
					{ label: "Attività recenti", to: "/activity", icon: HistoryIcon },
				],
			},
		],
	},
	{
		id: "sources",
		label: "Fonti dati",
		icon: DatabaseIcon,
		base: "/sources",
		groups: [
			{
				label: "Catalogo",
				items: [
					{ label: "Corsi e piani", to: "/sources/catalog", icon: DiplomaIcon },
					{ label: "Insegnamenti", to: "/sources/classes", icon: DocumentTextIcon },
				],
			},
			{
				label: "Da integrare",
				items: [
					{
						label: "Orari",
						to: "/sources/timetables",
						icon: ClockCircleIcon,
						badge: "Spike",
					},
					{
						label: "Appelli",
						to: "/sources/exams",
						icon: CalendarIcon,
						badge: "Spike",
					},
				],
			},
		],
	},
	{
		id: "jobs",
		label: "Job",
		icon: PlayCircleIcon,
		base: "/jobs",
		groups: [
			{
				label: "Job",
				items: [
					{ label: "Esecuzioni", to: "/jobs", icon: ChecklistMinimalisticIcon },
					{ label: "Pianificazioni", to: "/jobs/schedules", icon: CalendarIcon },
				],
			},
		],
	},
	{
		id: "staging",
		label: "Staging",
		icon: LayersIcon,
		base: "/staging",
		groups: [
			{
				label: "Staging",
				items: [
					{ label: "Differenze", to: "/staging", icon: TransferHorizontalIcon },
					{ label: "Promozioni", to: "/staging/promotions", icon: LayersIcon },
				],
			},
		],
	},
	{
		id: "settings",
		label: "Impostazioni",
		icon: SettingsIcon,
		base: "/settings",
		groups: [
			{
				label: "Impostazioni",
				items: [
					{ label: "Connessioni", to: "/settings", icon: PlugCircleIcon },
					{ label: "Accesso", to: "/settings/access", icon: ShieldKeyholeIcon },
				],
			},
		],
	},
];

/** The section a path belongs to; the home section owns every path no other section claims. */
export function sectionOf(pathname: string): NavSection {
	return NAV.find(s => s.base !== "/" && pathname.startsWith(s.base)) ?? NAV[0]!;
}

export function itemOf(pathname: string): NavItem | undefined {
	const items = NAV.flatMap(s => s.groups.flatMap(g => g.items));
	return items.find(item => item.to === pathname);
}
