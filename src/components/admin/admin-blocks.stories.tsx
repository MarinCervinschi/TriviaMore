import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { AdminPageHeader } from "./admin-page-header";
import { AdminRowActions } from "./admin-row-actions";
import { BrowsePublicButton } from "./browse-public-button";

// The pieces every admin page is framed with. The row actions carry the object's name, which is what
// keeps a table from reading as twenty identical "Modifica".
const meta = {
	title: "Admin/Blocchi",
	parameters: { layout: "padded", session: { role: "SUPERADMIN" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
	name: "Intestazione",
	render: () => (
		<div className="space-y-10">
			<AdminPageHeader title="Utenti" description="128 utenti registrati" />
			<AdminPageHeader
				title="Alberi binari di ricerca"
				description="DIEF / Ingegneria Informatica / Analisi matematica I"
				backTo="/admin/classes/$classId"
				backParams={{ classId: "cl1" }}
				backLabel="Analisi matematica I"
				actions={<Button size="sm">Nuova domanda</Button>}
			/>
		</div>
	),
};

/**
 * With and without a label. Without, a table of twenty rows offers twenty controls all announced as
 * "Modifica" — which satisfies 4.1.2 and is still unusable.
 */
export const RowActions: Story = {
	name: "Azioni di riga",
	render: () => (
		<div className="flex flex-col items-end gap-6">
			<AdminRowActions onDelete={() => {}}>
				<Link to="/">
					<Pen2Icon className="h-4 w-4" />
				</Link>
			</AdminRowActions>
			<AdminRowActions onDelete={() => {}} label="Analisi matematica I">
				<Link to="/">
					<Pen2Icon className="h-4 w-4" />
				</Link>
			</AdminRowActions>
		</div>
	),
};

export const PublicLink: Story = {
	name: "Vedi nel sito",
	render: () => (
		<BrowsePublicButton to="/browse/$department" params={{ department: "dief" }} />
	),
};
