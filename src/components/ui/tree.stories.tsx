import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { cn } from "@/lib/utils";

import { Card } from "./card";
import { Tree, TreeItem } from "./tree";

const meta = {
	title: "UI/Tree",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Node = { level: number; name: string; state?: "open" | "closed" };

// A fixed expansion, mirroring ReUI's reference (Leads/Accounts open, the rest
// collapsed) — only the visible rows are listed.
const NODES: Node[] = [
	{ level: 0, name: "Leads", state: "open" },
	{ level: 1, name: "New Lead" },
	{ level: 1, name: "Contacted Lead" },
	{ level: 1, name: "Qualified Lead" },
	{ level: 0, name: "Accounts", state: "open" },
	{ level: 1, name: "Acme Corp", state: "closed" },
	{ level: 1, name: "Globex Inc", state: "open" },
	{ level: 2, name: "Contacts", state: "closed" },
	{ level: 2, name: "Opportunities", state: "closed" },
	{ level: 0, name: "Activities", state: "closed" },
	{ level: 0, name: "Support", state: "closed" },
];

function Row({ node }: { node: Node }) {
	return (
		<TreeItem level={node.level}>
			<div className="bg-background flex items-center gap-1 rounded-md px-2 py-1.5 text-sm">
				{node.state ? (
					<AltArrowDownIcon
						className={cn(
							"text-muted-foreground size-4 shrink-0 transition-transform",
							node.state === "closed" && "-rotate-90"
						)}
					/>
				) : (
					<span className="w-4 shrink-0" />
				)}
				<span className={node.level === 0 ? "font-semibold" : "font-medium"}>
					{node.name}
				</span>
			</div>
		</TreeItem>
	);
}

export const Default: Story = {
	name: "Indented lines",
	render: () => (
		<Card className="max-w-md p-2">
			<Tree indent={20}>
				{NODES.map((node, i) => (
					<Row key={i} node={node} />
				))}
			</Tree>
		</Card>
	),
};

export const SenzaLinee: Story = {
	name: "Senza linee",
	render: () => (
		<Card className="max-w-md p-2">
			<Tree indent={20} lines={false}>
				{NODES.map((node, i) => (
					<Row key={i} node={node} />
				))}
			</Tree>
		</Card>
	),
};
