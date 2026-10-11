import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageBand } from "./page-band";
import { ThemeIcons, ThemeToggle } from "./theme-toggle";

const meta = {
	title: "Layout/Blocchi",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Band({ level }: { level: "app" | "public" }) {
	return (
		<div className="bg-background relative isolate min-h-80 overflow-hidden">
			<PageBand level={level} />
			<div className="container pt-12">
				<p className="text-muted-foreground eyebrow">level = {level}</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight">
					Il titolo di una pagina
				</h1>
				<p className="text-muted-foreground mt-3 max-w-xl">
					La fascia sfuma verticalmente, così ogni superficie densa più in basso è
					piatta per costruzione: nessun opt-out da ricordare.
				</p>
			</div>
		</div>
	);
}

export const Band_: Story = {
	name: "La fascia",
	render: () => (
		<div className="divide-border divide-y">
			<Band level="app" />
			<Band level="public" />
		</div>
	),
};

export const Theme: Story = {
	name: "Interruttore del tema",
	parameters: { layout: "padded" },
	render: () => (
		<div className="flex flex-wrap items-center gap-8">
			<ThemeToggle />
			<ThemeToggle variant="outline" size="default" />
			<ThemeToggle disabled />
			<span className="inline-flex items-center gap-2 text-sm">
				solo le icone <ThemeIcons className="size-5" />
			</span>
		</div>
	),
};
