import type { Meta, StoryObj } from "@storybook/react-vite";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";

const meta = {
	title: "Icons/Google",
	component: GoogleIcon,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
} satisfies Meta<typeof GoogleIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<GoogleIcon className="size-4" />
			<GoogleIcon className="size-5" />
			<GoogleIcon className="size-6" />
			<GoogleIcon className="size-10" />
		</div>
	),
};

/** The mark keeps its four colours in both themes; check it on the dark surface too. */
export const InAButton: Story = {
	name: "Nel pulsante di accesso",
	render: () => (
		<Button variant="outline" className="w-72">
			<GoogleIcon className="mr-2" />
			Continua con Google
		</Button>
	),
};
