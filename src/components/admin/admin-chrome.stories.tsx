import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
	AdminStats,
	AdminUserStats,
	ContentTreeDepartment,
} from "@/lib/admin/types";

import { AdminSidebar } from "./admin-sidebar";
import { BrowseAdminButton } from "./browse-admin-button";
import { MaintainerInviteDialog } from "./maintainer-invite-dialog";

const meta = {
	title: "Admin/Chrome",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STATS: AdminStats = {
	departmentCount: 14,
	courseCount: 96,
	classCount: 412,
	sectionCount: 1_284,
	questionCount: 18_907,
};

const USER_STATS: AdminUserStats = {
	totalUsers: 1_842,
	byRole: { STUDENT: 1_806, MAINTAINER: 28, ADMIN: 7, SUPERADMIN: 1 },
	totalQuizAttempts: 24_318,
	recentQuizAttempts: 611,
	averageScore: 24.8,
	activeUsers: 317,
};

const TREE: ContentTreeDepartment[] = [
	{
		id: "d1",
		name: "Ingegneria «Enzo Ferrari»",
		courses: [
			{
				id: "c1",
				name: "Ingegneria Informatica",
				classes: [
					{
						id: "k1",
						name: "Analisi matematica I",
						sections: [
							{ id: "s1", name: "Limiti" },
							{ id: "s2", name: "Derivate" },
						],
					},
					{ id: "k2", name: "Algoritmi e strutture dati", sections: [] },
				],
			},
			{ id: "c2", name: "Computer Engineering", classes: [] },
		],
	},
	{
		id: "d2",
		name: "Scienze Fisiche, Informatiche e Matematiche",
		courses: [{ id: "c3", name: "Informatica", classes: [] }],
	},
];

const seeded = (role: "SUPERADMIN" | "ADMIN" | "MAINTAINER") => ({
	path: "/admin",
	session: { role },
	queryData: [
		[["admin", "stats"], STATS],
		[["admin", "userStats"], USER_STATS],
		[["admin", "contentTree"], TREE],
		[["admin", "requestCount"], 4],
		[
			["admin", "permissions"],
			{ role, managedDepartmentIds: ["d1"], maintainedCourseIds: ["c1"] },
		],
	],
});

function Rail({ children }: { children: React.ReactNode }) {
	return <div className="flex h-[720px]">{children}</div>;
}

export const SidebarSuperadmin: Story = {
	name: "La sidebar, SUPERADMIN",
	parameters: seeded("SUPERADMIN"),
	render: () => (
		<Rail>
			<AdminSidebar />
		</Rail>
	),
};

export const SidebarAdmin: Story = {
	name: "La sidebar, ADMIN",
	parameters: seeded("ADMIN"),
	render: () => (
		<Rail>
			<AdminSidebar />
		</Rail>
	),
};

/** A maintainer gets no users section and no content tree. */
export const SidebarMaintainer: Story = {
	name: "La sidebar, MAINTAINER",
	parameters: seeded("MAINTAINER"),
	render: () => (
		<Rail>
			<AdminSidebar />
		</Rail>
	),
};

/** The button shows on c1, a course this maintainer has, and not on c2. */
export const AdminButton: Story = {
	name: "Il bottone di gestione",
	parameters: { ...seeded("MAINTAINER"), layout: "padded" },
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<BrowseAdminButton to="/admin/departments" courseId="c1" />
			<BrowseAdminButton to="/admin/departments" courseId="c2" />
			<BrowseAdminButton to="/admin/departments" />
		</div>
	),
};

export const AdminButtonFullAdmin: Story = {
	name: "Il bottone, ADMIN",
	parameters: { ...seeded("ADMIN"), layout: "padded" },
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<BrowseAdminButton to="/admin/departments" courseId="c1" />
			<BrowseAdminButton to="/admin/departments" />
		</div>
	),
};

export const Invite: Story = {
	name: "L'invito a maintainer",
	parameters: { ...seeded("SUPERADMIN"), layout: "padded" },
	render: () => (
		<MaintainerInviteDialog
			userId="u1"
			userName="Marin Cervinschi"
			userEmail="marin@example.com"
			courses={[
				{ id: "c1", name: "Ingegneria Informatica", code: "L-8" },
				{ id: "c2", name: "Computer Engineering", code: "LM-32" },
				{ id: "c3", name: "Informatica", code: "L-31" },
			]}
		/>
	),
};
