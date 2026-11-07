import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordSearch = {
	token: string;
	error: string;
	from?: "signup";
};

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		token: typeof search.token === "string" ? search.token : "",
		error: typeof search.error === "string" ? search.error : "",
		...(search.from === "signup" ? { from: "signup" as const } : {}),
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token, error, from } = Route.useSearch();
	const valid = token && !error;
	const signup = from === "signup";

	if (!valid) {
		return (
			<AuthCard
				title="Link non valido"
				description="Il link è scaduto o è già stato usato"
			>
				<p className="text-muted-foreground text-center text-sm">
					<Link
						to="/auth/forgot-password"
						className="text-brand font-semibold underline-offset-4 hover:underline"
					>
						Chiedi un nuovo link
					</Link>
				</p>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title={signup ? "Scegli la password" : "Scegli una nuova password"}
			description={
				signup
					? "Salvandola confermi la tua email e attivi l'account"
					: "Dopo il cambio, le sessioni aperte sugli altri dispositivi vengono chiuse"
			}
		>
			<ResetPasswordForm token={token} variant={signup ? "signup" : "reset"} />
		</AuthCard>
	);
}
