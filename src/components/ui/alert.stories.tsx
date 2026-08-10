import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
	title: "UI/Alert",
	component: Alert,
	tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Alert className="w-96">
			<InfoCircleIcon />
			<AlertTitle>Suggerimento</AlertTitle>
			<AlertDescription>
				Puoi riprendere un quiz interrotto dalla tua area personale.
			</AlertDescription>
		</Alert>
	),
};

export const Destructive: Story = {
	render: () => (
		<Alert variant="destructive" className="w-96">
			<DangerTriangleIcon />
			<AlertTitle>Errore</AlertTitle>
			<AlertDescription>Non hai accesso a questa sezione.</AlertDescription>
		</Alert>
	),
};
