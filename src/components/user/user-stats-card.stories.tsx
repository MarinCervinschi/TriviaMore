import { Flame, Target, Trophy } from "lucide-react"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { UserStatsCard } from "./user-stats-card"

const meta = {
  title: "Stat Cards/User",
  component: UserStatsCard,
  tags: ["autodocs"],
  args: {
    label: "Quiz completati",
    value: 42,
    icon: Flame,
    iconColor: "text-primary",
    iconBg: "primary",
  },
} satisfies Meta<typeof UserStatsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <UserStatsCard
        label="Quiz completati"
        value={42}
        icon={Flame}
        iconColor="text-primary"
        iconBg="primary"
      />
      <UserStatsCard
        label="Punteggio medio"
        value="27/30"
        icon={Target}
        iconColor="text-green-500"
        iconBg="green"
      />
      <UserStatsCard
        label="Record"
        value="30L"
        icon={Trophy}
        iconColor="text-yellow-500"
        iconBg="yellow"
      />
    </div>
  ),
}
