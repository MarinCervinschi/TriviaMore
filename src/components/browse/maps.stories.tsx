import type { Meta, StoryObj } from "@storybook/react-vite";

import type { DepartmentLocation, OverviewLocation } from "@/lib/browse/types";

import { DepartmentMap } from "./department-map";
import { OverviewMap } from "./overview-map";

/**
 * The two campus maps. They draw through Leaflet on real tiles, so like the network graph they can only
 * be judged in the browser — and the tiles follow the theme, which is the thing worth checking when a
 * colour moves.
 */
const meta = {
	title: "Browse/Mappe",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DIEF: DepartmentLocation[] = [
	{
		id: "l1",
		name: "Dipartimento di Ingegneria «Enzo Ferrari»",
		address: "Via Pietro Vivarelli 10, Modena",
		latitude: "44.6303",
		longitude: "10.9484",
		campusLocation: "MODENA",
		isPrimary: true,
		position: 0,
	},
	{
		id: "l2",
		name: "Aule didattiche di Via Campi",
		address: "Via Giuseppe Campi 213/b, Modena",
		latitude: "44.6479",
		longitude: "10.9250",
		campusLocation: "MODENA",
		isPrimary: false,
		position: 1,
	},
];

const ALL: OverviewLocation[] = [
	...DIEF.map(l => ({
		...l,
		department: { code: "DIEF", name: "Ingegneria «Enzo Ferrari»" },
	})),
	{
		id: "l3",
		name: "Dipartimento di Scienze della Vita",
		address: "Via Giovanni Amendola 2, Reggio Emilia",
		latitude: "44.6989",
		longitude: "10.6297",
		campusLocation: "REGGIO_EMILIA",
		isPrimary: true,
		position: 0,
		department: { code: "DSV", name: "Scienze della Vita" },
	},
	{
		id: "l4",
		name: "Polo di Mantova",
		address: "Via Scarsellini 2, Mantova",
		latitude: "45.1564",
		longitude: "10.7914",
		campusLocation: "MANTOVA",
		isPrimary: false,
		position: 1,
		department: { code: "DCE", name: "Comunicazione ed Economia" },
	},
];

export const Department: Story = {
	name: "Le sedi di un dipartimento",
	render: () => <DepartmentMap locations={DIEF} />,
};

/** One location: the map still fits its bounds, which is the case that used to zoom to the whole planet. */
export const SingleLocation: Story = {
	name: "Una sola sede",
	render: () => <DepartmentMap locations={[DIEF[0]]} />,
};

export const Overview: Story = {
	name: "Tutte le sedi",
	render: () => <OverviewMap locations={ALL} />,
};

export const Empty: Story = {
	name: "Nessuna sede",
	render: () => (
		<div className="space-y-6">
			<DepartmentMap locations={[]} />
			<OverviewMap locations={[]} />
		</div>
	),
};
