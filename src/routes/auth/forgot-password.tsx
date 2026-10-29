import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { requireGuestFn } from "@/lib/auth/api";

export const Route = createFileRoute("/auth/forgot-password")({
	beforeLoad: () => requireGuestFn(),
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Password dimenticata"
			description="Ti mandiamo un link per sceglierne una nuova"
		>
			<div className="grid gap-6">
				<ForgotPasswordForm />
				<p className="text-muted-foreground text-center text-sm">
					<Link
						to="/auth/login"
						className="text-brand font-semibold underline-offset-4 hover:underline"
					>
						Torna al login
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
