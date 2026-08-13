import type { ReactNode } from "react";

import { BoxMinimalisticIcon } from "@solar-icons/react/linear/box-minimalistic";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { LetterOpenedIcon } from "@solar-icons/react/linear/letter-opened";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { IconStack } from "./icon-stack";

const meta = {
	title: "UI/IconStack",
	component: IconStack,
	tags: ["autodocs"],
	args: {
		children: <BoxMinimalisticIcon className="text-brand h-8 w-8" />,
	},
} satisfies Meta<typeof IconStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function Sample({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-3">
			{children}
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}

/**
 * Pannelli neutri sempre; è l'icona a portare il colore — `text-brand` ovunque, `text-danger` nei
 * contesti di errore. Sopra una card si passa `**:data-[slot=icon-stack-layer]:fill-card` così le
 * facce si fondono con la superficie. Da guardare in entrambi i temi.
 */
export const UsiReali: Story = {
	name: "Usi reali",
	render: () => (
		<div className="flex flex-wrap items-end gap-12">
			<Sample label="Empty state / 404">
				<IconStack>
					<BoxMinimalisticIcon className="text-brand h-8 w-8" />
				</IconStack>
			</Sample>
			<Sample label="Ricerca">
				<IconStack>
					<MagnifierIcon className="text-brand h-8 w-8" />
				</IconStack>
			</Sample>
			<Sample label="Conferma email">
				<IconStack>
					<LetterOpenedIcon className="text-brand h-8 w-8" />
				</IconStack>
			</Sample>
			<Sample label="Errore">
				<IconStack>
					<DangerTriangleIcon className="text-danger h-8 w-8" />
				</IconStack>
			</Sample>
		</div>
	),
};
