import { type ComponentType, useId } from "react";

import { AtomIcon } from "@solar-icons/react/linear/atom";
import { BookIcon } from "@solar-icons/react/linear/book";
import { BoxMinimalisticIcon } from "@solar-icons/react/linear/box-minimalistic";
import { Chart2Icon } from "@solar-icons/react/linear/chart-2";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "@/components/ui/card";

// Deletable lab — kept for tuning the card pixel texture with live controls. A static "pixel card":
// tiny squares at variable size and tone, monochrome on `--foreground` (theme-aware), faded by
// placement. Use the Controls panel; toggle the theme in the toolbar.

type Placement =
	| "full"
	| "top"
	| "bottom"
	| "left"
	| "right"
	| "tl"
	| "tr"
	| "bl"
	| "br"
	| "center"
	| "ellipse"
	| "edges";

const FADE: Record<Placement, string | undefined> = {
	full: undefined,
	top: "linear-gradient(to bottom, #000 0%, #000 10%, transparent 72%)",
	bottom: "linear-gradient(to top, #000 0%, #000 10%, transparent 72%)",
	left: "linear-gradient(to right, #000 0%, #000 10%, transparent 72%)",
	right: "linear-gradient(to left, #000 0%, #000 10%, transparent 72%)",
	tl: "radial-gradient(125% 125% at 0% 0%, #000 0%, transparent 60%)",
	tr: "radial-gradient(125% 125% at 100% 0%, #000 0%, transparent 60%)",
	bl: "radial-gradient(125% 125% at 0% 100%, #000 0%, transparent 60%)",
	br: "radial-gradient(125% 125% at 100% 100%, #000 0%, transparent 60%)",
	center: "radial-gradient(70% 70% at 50% 50%, #000 0%, transparent 78%)",
	ellipse: "radial-gradient(95% 55% at 50% 50%, #000 0%, transparent 80%)",
	edges: "radial-gradient(75% 75% at 50% 50%, transparent 28%, #000 92%)",
};

const PLACEMENTS = Object.keys(FADE) as Placement[];

// Deterministic [0,1) hash — no Math.random, so the field never reshuffles between renders.
function hash(i: number, seed: number): number {
	const x = Math.sin(i * 127.1 + seed) * 43758.5453;
	return x - Math.floor(x);
}

const MIN_SIZE = 0.5;

type FieldProps = { placement: Placement; gap: number; maxSize: number; alpha: number };

function PixelField({ placement, gap, maxSize, alpha }: FieldProps) {
	const id = useId().replace(/:/g, "");
	const n = 16;
	const tile = n * gap;
	const fade = FADE[placement];
	const cells = Array.from({ length: n * n }, (_, i) => {
		const size = MIN_SIZE + hash(i, 311.7) * (maxSize - MIN_SIZE);
		const inset = (maxSize - size) / 2;
		return {
			x: (i % n) * gap + inset,
			y: Math.floor(i / n) * gap + inset,
			size,
			opacity: 0.45 + hash(i, 74.7) * 0.55,
		};
	});
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0"
			style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
		>
			<svg
				className="block h-full w-full"
				style={{ color: `hsl(var(--foreground) / ${alpha})` }}
			>
				<defs>
					<pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
						{cells.map((c, i) => (
							<rect
								key={i}
								x={c.x}
								y={c.y}
								width={c.size}
								height={c.size}
								fill="currentColor"
								fillOpacity={c.opacity}
							/>
						))}
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#${id})`} />
			</svg>
		</div>
	);
}

type IconComp = ComponentType<{ className?: string }>;

function TextureCard({
	Icon,
	title,
	desc,
	...field
}: FieldProps & { Icon: IconComp; title: string; desc: string }) {
	return (
		<Card className="border-border/50 relative h-44 overflow-hidden p-5 shadow-xs">
			<PixelField {...field} />
			<div className="relative flex h-full flex-col justify-end gap-3">
				<div className="bg-muted border-border/70 flex h-10 w-10 items-center justify-center rounded-xl border">
					<Icon className="text-foreground h-5 w-5" />
				</div>
				<div>
					<p className="font-semibold">{title}</p>
					<p className="text-muted-foreground text-sm">{desc}</p>
				</div>
			</div>
		</Card>
	);
}

const EXAMPLES: { Icon: IconComp; title: string; desc: string }[] = [
	{ Icon: Chart2Icon, title: "Performance", desc: "Optimize speed and efficiency" },
	{
		Icon: BoxMinimalisticIcon,
		title: "Design System",
		desc: "Build with consistent UI blocks",
	},
	{ Icon: AtomIcon, title: "Integrazioni", desc: "Connect your tools and data" },
	{ Icon: BookIcon, title: "Documentation", desc: "Guides and best practices" },
];

const meta = {
	title: "Style Lab/Card Surface",
	parameters: { layout: "fullscreen" },
	decorators: [
		Story => (
			<div className="container py-8">
				<Story />
			</div>
		),
	],
	argTypes: {
		placement: { control: "select", options: PLACEMENTS },
		gap: { control: { type: "range", min: 3, max: 14, step: 1 } },
		maxSize: { control: { type: "range", min: 1, max: 4, step: 0.5 } },
		alpha: { control: { type: "range", min: 0.05, max: 1, step: 0.05 } },
	},
	args: { placement: "tl", gap: 4, maxSize: 2, alpha: 0.2 },
} satisfies Meta<FieldProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fila di card con icone vere e i controlli della texture. Toggle il tema. */
export const Esempi: Story = {
	render: args => (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{EXAMPLES.map(example => (
				<TextureCard key={example.title} {...args} {...example} />
			))}
		</div>
	),
};
