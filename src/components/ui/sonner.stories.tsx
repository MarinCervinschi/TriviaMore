import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { ThemeProvider } from "@/providers/theme-provider";

import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
	title: "UI/Sonner",
	component: Toaster,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<Toaster />
			<Button onClick={() => toast("Quiz salvato tra le bozze")}>
				Notifica
			</Button>
			<Button
				variant="secondary"
				onClick={() =>
					toast.success("Risposta corretta!", {
						description: "Hai completato la sezione Analisi Matematica I.",
					})
				}
			>
				Successo
			</Button>
			<Button
				variant="destructive"
				onClick={() =>
					toast.error("Impossibile inviare il quiz", {
						description: "Controlla la connessione e riprova.",
					})
				}
			>
				Errore
			</Button>
		</div>
	),
};
