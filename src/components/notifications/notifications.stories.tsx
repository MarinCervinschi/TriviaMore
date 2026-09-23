import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
} from "@/components/ui/sidebar";
import type { Notification } from "@/lib/notifications/types";

import { ChangelogMegaphoneRow } from "./changelog-megaphone";
import { SidebarNotificationBell } from "./notification-bell";
import { NotificationItem } from "./notification-item";
import { NotificationList } from "./notification-list";
import { NotificationPopover } from "./notification-popover";

/**
 * The notification stack. `NotificationList` and `NotificationPopover` read the `["notifications"]`
 * query, and the rail badges read the unread counts — all three are seeded through
 * `parameters.queryData`, so the mutations still throw if you click them and the render is real.
 */
const meta = {
	title: "Notifications/Notifiche",
	parameters: { layout: "padded", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function BadgeRows() {
	return (
		<SidebarProvider>
			<Sidebar collapsible="none" className="w-64 rounded-2xl border">
				<SidebarHeader>
					<div className="flex items-center gap-1">
						<span className="text-sm font-semibold">TriviaMore</span>
						<div className="ml-auto">
							<SidebarNotificationBell />
						</div>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<div className="bg-popover text-popover-foreground m-2 rounded-xl border py-1">
						<ChangelogMegaphoneRow />
					</div>
				</SidebarContent>
			</Sidebar>
		</SidebarProvider>
	);
}

const TYPES: Notification["type"][] = [
	"REQUEST_STATUS_CHANGED",
	"NEW_REQUEST_RECEIVED",
	"REQUEST_NEEDS_REVISION",
	"REQUEST_REVISED",
	"CONTENT_UPDATED",
	"NEW_SECTION_ADDED",
	"MAINTAINER_ASSIGNED",
	"ACHIEVEMENT_UNLOCKED",
];

const BODIES: Record<Notification["type"], { title: string; body: string }> = {
	REQUEST_STATUS_CHANGED: {
		title: "Richiesta approvata",
		body: "Le tue 24 domande su «Alberi binari» sono online.",
	},
	NEW_REQUEST_RECEIVED: {
		title: "Nuova richiesta da revisionare",
		body: "Marin ha proposto una sezione per Analisi matematica I.",
	},
	REQUEST_NEEDS_REVISION: {
		title: "Richiesta da correggere",
		body: "Tre domande hanno la risposta corretta sempre in prima posizione.",
	},
	REQUEST_REVISED: {
		title: "Richiesta aggiornata",
		body: "La proposta è stata corretta ed è di nuovo in attesa.",
	},
	CONTENT_UPDATED: {
		title: "Contenuti aggiornati",
		body: "Sono state aggiunte 12 domande a una sezione che segui.",
	},
	NEW_SECTION_ADDED: {
		title: "Nuova sezione",
		body: "«Grafi e cammini minimi» è disponibile in Algoritmi.",
	},
	MAINTAINER_ASSIGNED: {
		title: "Sei maintainer",
		body: "Ora puoi gestire i contenuti di Ingegneria Informatica.",
	},
	ACHIEVEMENT_UNLOCKED: {
		title: "Nuovo traguardo: Esploratore",
		body: "Completa un quiz in 10 sezioni diverse.",
	},
};

const HOUR = 3600_000;
const BASE = new Date("2026-08-13T09:00:00.000Z").getTime();

function make(
	type: Notification["type"],
	index: number,
	isRead: boolean
): Notification {
	return {
		id: `n-${index}`,
		userId: "story-user",
		type,
		title: BODIES[type].title,
		body: BODIES[type].body,
		referenceId: "r-1",
		referenceType: "request",
		link: "/user/requests",
		isRead,
		createdAt: new Date(BASE - index * 7 * HOUR).toISOString(),
	};
}

const ALL = TYPES.map((type, i) => make(type, i, i > 2));

/** Every type, unread on the left and read on the right: the icon and the dot are the only difference. */
export const Item: Story = {
	name: "La voce, tutti i tipi",
	render: () => (
		<div className="grid max-w-5xl gap-4 lg:grid-cols-2">
			{TYPES.map((type, i) => (
				<NotificationItem
					key={`unread-${type}`}
					notification={make(type, i, false)}
					onMarkRead={() => {}}
					onDelete={() => {}}
				/>
			))}
		</div>
	),
};

export const Compact: Story = {
	name: "La voce compatta",
	render: () => (
		<div className="bg-popover max-w-sm rounded-xl border">
			{ALL.slice(0, 4).map((n, i) => (
				<NotificationItem key={n.id} notification={make(n.type, i, i > 1)} compact />
			))}
		</div>
	),
};

export const List: Story = {
	name: "La pagina",
	parameters: { queryData: [[["notifications"], ALL]] },
	render: () => (
		<div className="mx-auto max-w-3xl">
			<NotificationList />
		</div>
	),
};

export const Empty: Story = {
	name: "La pagina vuota",
	parameters: { queryData: [[["notifications"], []]] },
	render: () => (
		<div className="mx-auto max-w-3xl">
			<NotificationList />
		</div>
	),
};

export const Popover: Story = {
	name: "Il popover del campanello",
	parameters: { queryData: [[["notifications"], ALL]] },
	render: () => (
		<div className="bg-popover text-popover-foreground w-80 rounded-xl border shadow-lg">
			<NotificationPopover onClose={() => {}} />
		</div>
	),
};

/** The bell's dot and Novità's count, at 3 and past 99 where the pill caps. */
export const RailBadges: Story = {
	name: "Gli indicatori di non letto",
	parameters: {
		queryData: [
			[["notifications", "unreadCount"], 3],
			[
				["changelogs", "unreadVersions"],
				[{ version: "1.4.0" }, { version: "1.3.0" }],
			],
		],
	},
	render: () => <BadgeRows />,
};

export const RailBadgesOverflow: Story = {
	name: "I badge oltre 99",
	parameters: {
		queryData: [
			[["notifications", "unreadCount"], 128],
			[
				["changelogs", "unreadVersions"],
				Array.from({ length: 12 }, (_, i) => ({ version: `1.${i}.0` })),
			],
		],
	},
	render: () => <BadgeRows />,
};
