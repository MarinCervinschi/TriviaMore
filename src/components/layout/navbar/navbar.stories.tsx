import type { Meta, StoryObj } from "@storybook/react-vite";

import { Navbar } from "./index";
import { MobileMenu } from "./mobile-menu";
import { AuthSection, UserMenu } from "./user-menu";

// The top bar the app shows to a visitor. `_app` mounts it only when signed out, so the guest story is
// the real one — the signed-in branch of AuthSection exists but the shell never renders it.
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

/**
 * The auth corner on its own, in the three states it can be in. The signed-in one is unreachable
 * through the shell today — worth keeping visible so the divergence does not go unnoticed.
 */
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

/** The dropdown behind the avatar: the role badge and the admin entry are what change with the role. */
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
