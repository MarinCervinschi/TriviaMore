import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";

const meta = {
	title: "Layout/Sidebar",
	parameters: { layout: "fullscreen", session: { role: "STUDENT" } },
	render: (_args, { parameters }) => (
		<SidebarProvider defaultOpen={parameters.sidebarOpen ?? true}>
			<AppSidebar />
			<SidebarInset className="min-h-[42rem]" />
		</SidebarProvider>
	),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Student: Story = {
	name: "Studente",
	parameters: { path: "/user" },
};

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

export const Collapsed: Story = {
	name: "Ridotta a icone",
	parameters: { path: "/user", sidebarOpen: false },
};

/** With no name and no image, the avatar shows the email's initial. */
export const NoProfile: Story = {
	name: "Senza nome né immagine",
	parameters: {
		session: { role: "STUDENT", name: "", email: "318011@studenti.unimore.it" },
	},
};
