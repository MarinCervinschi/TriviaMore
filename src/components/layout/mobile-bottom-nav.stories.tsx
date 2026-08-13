import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileBottomNav } from "./mobile-bottom-nav";

// The dock only renders below `md`, which is a viewport query and not a container one — so these
// stories pin the canvas to a phone through globals rather than wrapping it in something narrow, which
// would render nothing. Everything past the four primary slots lives in its "more" sheet, and that is
// where the real menu is.
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

/** MAINTAINER and above gain Gestione inside the sheet. */
export const Maintainer: Story = {
	name: "Maintainer",
	parameters: { session: { role: "MAINTAINER" }, path: "/browse" },
};
