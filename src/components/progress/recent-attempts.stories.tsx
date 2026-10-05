import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AttemptHistoryEntry } from "@/lib/user/types";

import { ATTEMPTS } from "./fixtures";
import { RecentAttempts } from "./recent-attempts";

const EDGE: AttemptHistoryEntry[] = [
	{ ...ATTEMPTS[0]!, id: "edge-1", sectionName: null },
	{ ...ATTEMPTS[1]!, id: "edge-2", timeSpent: null, quizMode: null },
];

const FULL = 1216;

const meta = {
	title: "Progress/Ultimi tentativi",
	component: RecentAttempts,
	parameters: { layout: "padded" },
	args: { attempts: ATTEMPTS },
	decorators: [
		Story => (
			<div style={{ width: FULL }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RecentAttempts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Cinque righe" };

/** A deleted section and an untimed quiz. */
export const CasiLimite: Story = {
	name: "Casi limite",
	args: { attempts: EDGE },
};

export const Vuoto: Story = { args: { attempts: [] } };
