import type { Meta, StoryObj } from "@storybook/react-vite";

import { LumaSidebar } from "./luma-sidebar";

// The rail is `fixed`, so these are fullscreen and it sits where it sits in the app. What changes
// between stories is the role — a maintainer or above gains the Gestione slot — and the location,
// which is what marks the active item.
const meta = {
	title: "Layout/Sidebar",
	parameters: { layout: "fullscreen", session: { role: "STUDENT" } },
	render: () => (
		<div className="min-h-[42rem]">
			<LumaSidebar />
		</div>
	),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Student: Story = {
	name: "Studente",
	parameters: { path: "/user" },
};

/** MAINTAINER and above get the Gestione icon; a student must not see it at all. */
export const Maintainer: Story = {
	name: "Maintainer",
	parameters: { session: { role: "MAINTAINER" }, path: "/admin/sections/x" },
};

export const Superadmin: Story = {
	name: "Superadmin",
	parameters: {
		session: { role: "SUPERADMIN", name: "Marin Cervinschi" },
		path: "/browse",
	},
};

/** No name and no image: the avatar falls back to an initial from the email. */
export const NoProfile: Story = {
	name: "Senza nome né immagine",
	parameters: {
		session: { role: "STUDENT", name: "", email: "318011@studenti.unimore.it" },
	},
};
