import { BookOpen, GraduationCap, Layers, Users } from "lucide-react"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { AdminStatCard } from "./admin-stat-card"

const meta = {
  title: "Stat Cards/Admin",
  component: AdminStatCard,
  tags: ["autodocs"],
  args: { label: "Utenti", value: 1280, icon: Users, color: "blue" },
} satisfies Meta<typeof AdminStatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSubtitle: Story = {
  args: { subtitle: "+12% questa settimana" },
}

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <AdminStatCard label="Utenti" value={1280} icon={Users} color="blue" />
      <AdminStatCard label="Corsi" value={64} icon={GraduationCap} color="green" />
      <AdminStatCard label="Insegnamenti" value={210} icon={BookOpen} color="orange" />
      <AdminStatCard label="Sezioni" value={512} icon={Layers} color="purple" />
    </div>
  ),
}
