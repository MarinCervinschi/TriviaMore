import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Separator } from "@/components/ui/separator";
import { requireGuestFn } from "@/lib/auth/api";

export const Route = createFileRoute("/auth/login")({
	beforeLoad: () => requireGuestFn(),
	component: LoginPage,
});

function LoginPage() {
	return (
		<AuthCard title="Bentornato" description="Accedi al tuo account TriviaMore">
			<div className="grid gap-6">
				<LoginForm />
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
				<OAuthButtons />
				<p className="text-muted-foreground text-center text-sm">
					Non hai un account?{" "}
					<Link
						to="/auth/register"
						className="text-brand font-semibold underline-offset-4 hover:underline"
					>
						Registrati
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
