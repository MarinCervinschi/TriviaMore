import { DangerCircleIcon } from "@solar-icons/react/linear/danger-circle";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { IconStack } from "@/components/ui/icon-stack";

export const Route = createFileRoute("/auth/auth-code-error")({
	validateSearch: (
		search: Record<string, unknown>
	): { error?: string; error_description?: string } => ({
		error: typeof search.error === "string" ? search.error : undefined,
		error_description:
			typeof search.error_description === "string"
				? search.error_description
				: undefined,
	}),
	component: AuthCodeErrorPage,
});

function AuthCodeErrorPage() {
	const { error, error_description } = Route.useSearch();
	const notAllowed = error === "email_not_allowed";

	return (
		<AuthCard
			title={notAllowed ? "Account non ammesso" : "Link non valido"}
			description={
				notAllowed
					? error_description || "Questo account non può accedere"
					: "Non è stato possibile completare l'accesso"
			}
		>
			<div className="grid gap-6">
				<div className="flex justify-center">
					<IconStack className="**:data-[slot=icon-stack-layer]:fill-card">
						<DangerCircleIcon className="text-danger h-8 w-8" />
					</IconStack>
				</div>

				{!notAllowed && (
					<p className="text-muted-foreground text-center text-sm">
						Il link è scaduto o è già stato usato, oppure l'accesso con Google o GitHub
						è stato interrotto. Accedi di nuovo: se l'email non è ancora confermata, ti
						mandiamo un nuovo link.
					</p>
				)}

				<div className="grid gap-3">
					<Button asChild size="lg" className="shadow-primary/25 w-full shadow-lg">
						<Link to="/auth/login">Vai al login</Link>
					</Button>
				</div>
			</div>
		</AuthCard>
	);
}
