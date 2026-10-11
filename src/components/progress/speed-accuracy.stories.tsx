import type { Meta, StoryObj } from "@storybook/react-vite";

import { MASTERY } from "./fixtures";
import { SpeedAccuracy } from "./speed-accuracy";

const PAGE_WIDTH = 805;

const meta = {
	title: "Progress/Velocità e precisione",
	component: SpeedAccuracy,
	parameters: { layout: "padded" },
	args: { sections: MASTERY.sections },
	decorators: [
		Story => (
			<div style={{ width: PAGE_WIDTH }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SpeedAccuracy>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The chip at the top right regroups by section, class or course. */
export const Default: Story = { name: "Per sezione" };

/** One point, where the guides stay but divide nothing. */
export const UnaSezione: Story = {
	name: "Una sezione",
	args: { sections: MASTERY.sections.slice(0, 1) },
};

/** No recorded times, so the chart places nothing and says so. */
export const SenzaTempi: Story = {
	name: "Senza tempi",
	args: { sections: MASTERY.sections.map(s => ({ ...s, avgSeconds: null })) },
};

/** Half the sections have no time, and the footer counts the excluded ones. */
export const ConEsclusioni: Story = {
	name: "Con esclusioni",
	args: {
		sections: MASTERY.sections.map((section, index) =>
			index % 2 === 0 ? { ...section, avgSeconds: null } : section
		),
	},
};
