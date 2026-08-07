import type { Meta, StoryObj } from "@storybook/react-vite"

import { RequestStatusBadge } from "./request-status-badge"

const meta = {
  title: "Requests/StatusBadge",
  component: RequestStatusBadge,
  tags: ["autodocs"],
  args: { status: "PENDING" },
} satisfies Meta<typeof RequestStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = { args: { status: "PENDING" } }
export const Approved: Story = { args: { status: "APPROVED" } }
export const Rejected: Story = { args: { status: "REJECTED" } }
export const NeedsRevision: Story = { args: { status: "NEEDS_REVISION" } }

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <RequestStatusBadge status="PENDING" />
      <RequestStatusBadge status="APPROVED" />
      <RequestStatusBadge status="REJECTED" />
      <RequestStatusBadge status="NEEDS_REVISION" />
    </div>
  ),
}
