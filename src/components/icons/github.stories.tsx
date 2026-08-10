import type { Meta, StoryObj } from "@storybook/react-vite";

import { GithubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";

const meta = {
	title: "Icons/GitHub",
	component: GithubIcon,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
} satisfies Meta<typeof GithubIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<GithubIcon className="size-4" />
			<GithubIcon className="size-5" />
			<GithubIcon className="size-6" />
			<GithubIcon className="size-10" />
		</div>
	),
};

export const NextToTheStrokedIcons: Story = {
	name: "Next to the stroked icons",
	render: () => (
		<div className="max-w-prose space-y-4">
			<p className="text-muted-foreground text-sm">
				The mark is filled where every Solar icon is stroked, so it reads heavier at the
				same size. That is inherent to a logo and the reason to check it beside a real
				icon rather than on its own.
			</p>
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="outline" size="sm">
					<GithubIcon className="mr-2 size-4" />
					Contribuisci
				</Button>
				<Button size="sm">
					<GithubIcon className="mr-2 size-4" />
					Apri su GitHub
				</Button>
			</div>
		</div>
	),
};
