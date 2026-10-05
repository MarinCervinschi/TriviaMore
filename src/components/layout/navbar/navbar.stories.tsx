import type { Meta, StoryObj } from "@storybook/react-vite";

import { Navbar } from "./index";
import { MobileMenu } from "./mobile-menu";
import { AuthSection, UserMenu } from "./user-menu";

const meta = {
	title: "Layout/Navbar",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
	name: "Visitatore",
	parameters: { path: "/" },
	render: () => (
		<div className="min-h-96">
			<Navbar />
		</div>
	),
};

export const OnBrowse: Story = {
	name: "Su una pagina interna",
	parameters: { path: "/browse" },
	render: () => (
		<div className="min-h-96">
			<Navbar />
		</div>
	),
};

export const AuthCorner: Story = {
	name: "L'angolo di autenticazione",
	parameters: { layout: "padded" },
	render: () => (
		<div className="flex flex-col items-end gap-6">
			<AuthSection />
		</div>
	),
};

export const AuthCornerSignedIn: Story = {
	name: "L'angolo, autenticato",
	parameters: { layout: "padded", session: { role: "SUPERADMIN" } },
	render: () => (
		<div className="flex flex-col items-end gap-6">
			<AuthSection />
		</div>
	),
};

export const User: Story = {
	name: "Il menù utente",
	parameters: { layout: "padded", session: { role: "SUPERADMIN" } },
	render: () => (
		<div className="flex justify-end">
			<UserMenu />
		</div>
	),
};

export const UserStudent: Story = {
	name: "Il menù utente, studente",
	parameters: { layout: "padded", session: { role: "STUDENT" } },
	render: () => (
		<div className="flex justify-end">
			<UserMenu />
		</div>
	),
};

export const Mobile: Story = {
	name: "Il menù mobile",
	globals: { viewport: { value: "iphone6" } },
	parameters: { layout: "padded", session: { role: "STUDENT" } },
	render: () => (
		<div className="flex justify-end">
			<MobileMenu />
		</div>
	),
};

export const MobileGuest: Story = {
	name: "Il menù mobile, visitatore",
	globals: { viewport: { value: "iphone6" } },
	parameters: { layout: "padded", session: null },
	render: () => (
		<div className="flex justify-end">
			<MobileMenu />
		</div>
	),
};
