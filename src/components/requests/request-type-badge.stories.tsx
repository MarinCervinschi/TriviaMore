import type { Meta, StoryObj } from "@storybook/react-vite";

import { RequestTypeBadge } from "./request-type-badge";

const meta = {
	title: "Requests/TypeBadge",
	component: RequestTypeBadge,
	tags: ["autodocs"],
	args: { type: "NEW_SECTION" },
} satisfies Meta<typeof RequestTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewSection: Story = { args: { type: "NEW_SECTION" } };
export const NewQuestions: Story = { args: { type: "NEW_QUESTIONS" } };
export const Report: Story = { args: { type: "REPORT" } };
export const FileUpload: Story = { args: { type: "FILE_UPLOAD" } };

export const All: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<RequestTypeBadge type="NEW_SECTION" />
			<RequestTypeBadge type="NEW_QUESTIONS" />
			<RequestTypeBadge type="REPORT" />
			<RequestTypeBadge type="FILE_UPLOAD" />
		</div>
	),
};
