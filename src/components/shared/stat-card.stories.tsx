import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookmarkIcon, GraduationCap, TrendingUp, Trophy } from "lucide-react";

import { StatCard } from "./stat-card";

const meta = {
	title: "Stat Cards/StatCard",
	component: StatCard,
	tags: ["autodocs"],
	args: { label: "Quiz completati", value: 42, icon: Trophy, color: "yellow" },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubtitle: Story = {
	args: { subtitle: "+12% questa settimana" },
};

// href renders a TanStack Router <Link>, which needs a router provider Storybook
// doesn't have — so the linked variant is exercised in the app, not here.

export const Grid: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4">
			<StatCard label="Quiz completati" value={42} icon={Trophy} color="yellow" />
			<StatCard label="Corsi seguiti" value={8} icon={GraduationCap} color="blue" />
			<StatCard label="Segnalibri" value={17} icon={BookmarkIcon} color="purple" />
			<StatCard label="Media" value="27/33" icon={TrendingUp} color="green" />
		</div>
	),
};
