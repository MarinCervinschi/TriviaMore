import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

const meta = {
	title: "UI/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="space-y-2">
			<Skeleton className="h-4 w-64" />
			<Skeleton className="h-4 w-48" />
			<Skeleton className="h-4 w-56" />
		</div>
	),
};

export const CourseCard: Story = {
	render: () => (
		<div className="flex w-80 items-center gap-4 rounded-xl border p-4">
			<Skeleton className="h-12 w-12 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-3 w-24" />
			</div>
		</div>
	),
};
