import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Pagination } from "./pagination";

const meta = {
	title: "UI/Pagination",
	component: Pagination,
	tags: ["autodocs"],
	args: {
		page: 1,
		totalPages: 5,
		totalItems: 48,
		pageSize: 10,
		onPageChange: () => {},
	},
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => {
		const [page, setPage] = useState(args.page);
		return <Pagination {...args} page={page} onPageChange={setPage} />;
	},
};

export const ManyPages: Story = {
	args: { page: 6, totalPages: 12, totalItems: 118, pageSize: 10 },
	render: (args) => {
		const [page, setPage] = useState(args.page);
		return <Pagination {...args} page={page} onPageChange={setPage} />;
	},
};
