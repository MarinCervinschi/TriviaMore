import type { Meta, StoryObj } from "@storybook/react-vite";

import { DepartmentCard, type DepartmentCardData } from "./department-card";

// The department card carries D4's decorative tint keyed to its area, and the area's icon beside it —
// which is what keeps colour from being the only channel when two areas collapse under CVD.
const meta = {
	title: "Browse/DepartmentCard",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DEPARTMENTS: DepartmentCardData[] = [
	{
		id: "d1",
		code: "DIEF",
		name: "Ingegneria Enzo Ferrari",
		description:
			"Ingegneria informatica, meccanica e dei materiali, fra Modena e Reggio Emilia.",
		area: "TECNOLOGIA",
		courseCount: 12,
		campusLocations: ["MODENA", "REGGIO_EMILIA"],
	},
	{
		id: "d2",
		code: "FIM",
		name: "Scienze Fisiche, Informatiche e Matematiche",
		description: "Matematica, fisica e informatica.",
		area: "SCIENZE",
		courseCount: 8,
		campusLocations: ["MODENA"],
	},
	{
		id: "d3",
		code: "CHIMOMO",
		name: "Scienze Biomediche, Metaboliche e Neuroscienze",
		description: null,
		area: "SALUTE",
		courseCount: 5,
		campusLocations: ["MODENA"],
	},
	{
		id: "d4",
		code: "DSV",
		name: "Scienze della Vita",
		description: "Biologia, biotecnologie e scienze degli alimenti.",
		area: "VITA",
		courseCount: 6,
		campusLocations: ["MODENA", "REGGIO_EMILIA"],
	},
	{
		id: "d5",
		code: "DESU",
		name: "Studi Linguistici e Culturali",
		description: "Lingue, culture e comunicazione.",
		area: "SOCIETA_CULTURA",
		courseCount: 4,
		campusLocations: ["MODENA"],
	},
];

/** All five areas at once, which is the only way to check the tints hold apart. */
export const AllAreas: Story = {
	name: "Tutte le aree",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{DEPARTMENTS.map(department => (
				<DepartmentCard key={department.id} department={department} />
			))}
		</div>
	),
};

/** No description, no area: the card has to hold its shape with the optional parts missing. */
export const Bare: Story = {
	name: "Senza descrizione né area",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2">
			<DepartmentCard
				department={{
					id: "bare",
					code: "XXX",
					name: "Dipartimento senza area",
					courseCount: 0,
					campusLocations: [],
				}}
			/>
			<DepartmentCard
				department={{
					id: "long",
					code: "LONGCODE",
					name: "Un nome di dipartimento deliberatamente lungo per vedere dove va a capo",
					description:
						"E una descrizione altrettanto lunga, che serve a controllare che il troncamento e la spaziatura tengano quando il contenuto reale non collabora.",
					area: "SCIENZE",
					courseCount: 137,
					campusLocations: ["MODENA", "REGGIO_EMILIA", "CARPI", "MANTOVA"],
				}}
			/>
		</div>
	),
};
