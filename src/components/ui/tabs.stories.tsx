import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
	title: "UI/Tabs",
	component: Tabs,
	tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Tabs defaultValue="sezioni" className="w-96">
			<TabsList>
				<TabsTrigger value="sezioni">Sezioni</TabsTrigger>
				<TabsTrigger value="domande">Domande</TabsTrigger>
				<TabsTrigger value="statistiche">Statistiche</TabsTrigger>
			</TabsList>
			<TabsContent value="sezioni" className="text-muted-foreground text-sm">
				6 sezioni nel corso di Analisi Matematica I.
			</TabsContent>
			<TabsContent value="domande" className="text-muted-foreground text-sm">
				142 domande totali, di cui 24 aggiunte questa settimana.
			</TabsContent>
			<TabsContent value="statistiche" className="text-muted-foreground text-sm">
				Punteggio medio degli studenti: 78%.
			</TabsContent>
		</Tabs>
	),
};
