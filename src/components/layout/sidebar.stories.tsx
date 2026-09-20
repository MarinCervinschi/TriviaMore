import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";

// The inset shell in miniature: the sidebar sits on the canvas and the content is the
// panel a tone above it, which is the whole point of the variant. What changes between
// stories is the role — a maintainer or above gains the Gestione row — and the location,
// which is what marks the active one. `defaultOpen` is what drives the collapsed story.
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

/** MAINTAINER and above get the Gestione row; a student must not see it at all. */
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

/** Collapsed to the icon rail: the labels go, the tooltips take over. */
export const Collapsed: Story = {
	name: "Ridotta a icone",
	parameters: { path: "/user", sidebarOpen: false },
};

/** The search row opens in place when there is room for it. */
export const SearchOpen: Story = {
	name: "Ricerca aperta",
	parameters: { path: "/search/courses" },
};

/** No name and no image: the avatar falls back to an initial from the email. */
export const NoProfile: Story = {
	name: "Senza nome né immagine",
	parameters: {
		session: { role: "STUDENT", name: "", email: "318011@studenti.unimore.it" },
	},
};
