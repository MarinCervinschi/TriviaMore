import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarkdownRenderer } from "./markdown-renderer";

const sample = `## Teorema fondamentale del calcolo

Il teorema collega **derivazione** e **integrazione** in un unico risultato.

Passaggi da ricordare:

- individuare una primitiva \`F\` della funzione \`f\`
- calcolare l'integrale definito come \`F(b) - F(a)\`
- verificare la **continuità** di \`f\` sull'intervallo \`[a, b]\`

Solo così l'area sotto la curva è calcolabile in forma chiusa.`;

const meta = {
	title: "UI/MarkdownRenderer",
	component: MarkdownRenderer,
	tags: ["autodocs"],
	args: { content: sample },
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inline: Story = {
	args: {
		inline: true,
		content: "La complessità dell'algoritmo è `O(n log n)`.",
	},
};
