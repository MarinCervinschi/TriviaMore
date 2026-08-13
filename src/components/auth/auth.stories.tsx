import type { ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";

import { AuthCard } from "./auth-card";
import { LoginForm } from "./login-form";
import { OAuthButtons } from "./oauth-buttons";
import { RegisterForm } from "./register-form";

/**
 * The two auth pages, assembled the way the routes assemble them. Submitting reaches a stubbed server
 * function and fails with a toast, which is the honest behaviour here: what these stories are for is
 * the shell, the field spacing and the validation states.
 */
const meta = {
	title: "Auth/Accesso",
	parameters: { layout: "fullscreen", session: null },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Or() {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<Separator />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="bg-card/80 text-muted-foreground px-3 backdrop-blur-sm">
					oppure
				</span>
			</div>
		</div>
	);
}

function Footer({
	children,
	to,
	label,
}: {
	children: ReactNode;
	to: string;
	label: string;
}) {
	return (
		<p className="text-muted-foreground text-center text-sm">
			{children}{" "}
			<Link
				to={to}
				className="text-brand font-semibold underline-offset-4 hover:underline"
			>
				{label}
			</Link>
		</p>
	);
}

export const Login: Story = {
	name: "Accedi",
	render: () => (
		<AuthCard title="Bentornato" description="Accedi al tuo account TriviaMore">
			<div className="grid gap-6">
				<LoginForm />
				<Or />
				<OAuthButtons />
				<Footer to="/auth/register" label="Registrati">
					Non hai un account?
				</Footer>
			</div>
		</AuthCard>
	),
};

export const Register: Story = {
	name: "Registrati",
	render: () => (
		<AuthCard
			title="Crea un account"
			description="Registrati per iniziare a usare TriviaMore"
		>
			<div className="grid gap-6">
				<RegisterForm />
				<Or />
				<OAuthButtons />
				<Footer to="/auth/login" label="Accedi">
					Hai già un account?
				</Footer>
			</div>
		</AuthCard>
	),
};

/** The shell on its own: band, logo, theme toggle, back link — everything around the form. */
export const Shell: Story = {
	name: "Il guscio",
	render: () => (
		<AuthCard title="Un titolo" description="Una descrizione che occupa una riga sola.">
			<div className="text-muted-foreground border-border rounded-xl border border-dashed p-8 text-center text-sm">
				il form sta qui
			</div>
		</AuthCard>
	),
};

export const OAuth: Story = {
	name: "I provider",
	parameters: { layout: "padded" },
	render: () => (
		<div className="max-w-sm">
			<OAuthButtons />
		</div>
	),
};
