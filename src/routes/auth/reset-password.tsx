import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: (search: Record<string, unknown>) => ({
		token: typeof search.token === "string" ? search.token : "",
		error: typeof search.error === "string" ? search.error : "",
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token, error } = Route.useSearch();
	const valid = token && !error;

	return (
		<AuthCard
			title={valid ? "Scegli una nuova password" : "Link non valido"}
			description={
				valid
					? "Dopo il cambio, le sessioni aperte sugli altri dispositivi vengono chiuse"
					: "Il link è scaduto o è già stato usato"
			}
		>
			<div className="grid gap-6">
				{valid ? (
					<ResetPasswordForm token={token} />
				) : (
					<p className="text-muted-foreground text-center text-sm">
						<Link
							to="/auth/forgot-password"
							className="text-brand font-semibold underline-offset-4 hover:underline"
						>
							Chiedi un nuovo link
						</Link>
					</p>
				)}
			</div>
		</AuthCard>
	);
}
