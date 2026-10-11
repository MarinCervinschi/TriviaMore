import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileBottomNav } from "./mobile-bottom-nav";

const meta = {
	title: "Layout/MobileBottomNav",
	globals: { viewport: { value: "iphone6" } },
	parameters: { layout: "fullscreen", session: { role: "STUDENT" } },
	render: () => (
		<div className="min-h-[36rem]">
			<MobileBottomNav />
		</div>
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
	parameters: { session: { role: "MAINTAINER" }, path: "/browse" },
};
