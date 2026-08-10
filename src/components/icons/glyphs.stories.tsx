import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	CheckGlyph,
	CloseGlyph,
	DotGlyph,
	MinusGlyph,
	PlusGlyph,
} from "@/components/icons/glyphs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta = {
	title: "Icons/Glyphs",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const GLYPHS = [
	{ name: "CloseGlyph", Glyph: CloseGlyph, replaces: "Lucide X" },
	{ name: "PlusGlyph", Glyph: PlusGlyph, replaces: "Lucide Plus" },
	{ name: "MinusGlyph", Glyph: MinusGlyph, replaces: "Lucide Minus" },
	{ name: "CheckGlyph", Glyph: CheckGlyph, replaces: "Lucide Check" },
	{ name: "DotGlyph", Glyph: DotGlyph, replaces: "Lucide Circle" },
];

export const Sizes: Story = {
	render: () => (
		<div className="space-y-8">
			<div className="grid grid-cols-[10rem_repeat(4,4rem)] items-center gap-4">
				<span className="text-muted-foreground text-xs">glifo</span>
				<span className="text-muted-foreground text-xs">12</span>
				<span className="text-muted-foreground text-xs">16</span>
				<span className="text-muted-foreground text-xs">20</span>
				<span className="text-muted-foreground text-xs">32</span>
				{GLYPHS.map(({ name, Glyph, replaces }) => (
					<div key={name} className="col-span-5 grid grid-cols-subgrid items-center">
						<div>
							<p className="text-sm font-medium">{name}</p>
							<p className="text-muted-foreground text-xs">{replaces}</p>
						</div>
						<Glyph className="size-3" />
						<Glyph className="size-4" />
						<Glyph className="size-5" />
						<Glyph className="size-8" />
					</div>
				))}
			</div>
		</div>
	),
};

export const AgainstTheCircledSolarVariants: Story = {
	name: "Against the circled Solar variants",
	render: () => (
		<div className="space-y-2">
			<p className="text-muted-foreground max-w-prose text-sm">
				The reason these are drawn rather than imported: Solar only ships each mark
				wrapped. The wrapped form is correct in a standalone status role and wrong
				inside a control that already has a shape.
			</p>
			<div className="grid grid-cols-[8rem_5rem_5rem] items-center gap-4 pt-4">
				<span className="text-muted-foreground text-xs">mark</span>
				<span className="text-muted-foreground text-xs">glyph</span>
				<span className="text-muted-foreground text-xs">Solar circled</span>

				<span className="text-sm">close</span>
				<CloseGlyph className="size-5" />
				<CloseCircleIcon className="size-5" />

				<span className="text-sm">plus</span>
				<PlusGlyph className="size-5" />
				<AddCircleIcon className="size-5" />

				<span className="text-sm">minus</span>
				<MinusGlyph className="size-5" />
				<MinusCircleIcon className="size-5" />

				<span className="text-sm">check</span>
				<CheckGlyph className="size-5" />
				<CheckCircleIcon className="size-5" />
			</div>
		</div>
	),
};

export const InTheControlsThatUseThem: Story = {
	name: "In the controls that use them",
	render: () => (
		<div className="flex max-w-md flex-col gap-8">
			<label className="flex items-center gap-3 text-sm">
				<Checkbox defaultChecked />
				Un checkbox: il segno di spunta sta dentro un quadrato
			</label>

			<RadioGroup defaultValue="a" className="gap-3">
				<label className="flex items-center gap-3 text-sm">
					<RadioGroupItem value="a" />
					Un radio: il punto sta dentro un cerchio
				</label>
				<label className="flex items-center gap-3 text-sm">
					<RadioGroupItem value="b" />
					Seconda opzione
				</label>
			</RadioGroup>

			<div className="flex items-center gap-3">
				<Button size="sm">
					<PlusGlyph className="mr-1.5 size-4" />
					Aggiungi
				</Button>
				<Button size="icon" variant="ghost" aria-label="Chiudi">
					<CloseGlyph className="size-4" />
				</Button>
				<Button size="sm" variant="outline">
					<MagnifierIcon className="mr-1.5 size-4" />
					Cerca
				</Button>
			</div>
		</div>
	),
};
