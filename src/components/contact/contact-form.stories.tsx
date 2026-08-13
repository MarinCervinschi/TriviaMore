import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContactForm } from "./contact-form";

/**
 * The contact form. Signed in, the email arrives filled and locked to the account — the one difference
 * between the two stories, and the reason both exist.
 */
const meta = {
	title: "Contact/Form",
	component: ContactForm,
	parameters: { layout: "padded" },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
	name: "Visitatore",
	parameters: { session: null },
	render: () => (
		<div className="mx-auto max-w-2xl">
			<ContactForm />
		</div>
	),
};

export const SignedIn: Story = {
	name: "Autenticato",
	parameters: { session: { role: "STUDENT", email: "marin@example.com" } },
	render: () => (
		<div className="mx-auto max-w-2xl">
			<ContactForm />
		</div>
	),
};
