import { DangerCircleIcon } from "@solar-icons/react/linear/danger-circle";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { IconStack } from "@/components/ui/icon-stack";

export const Route = createFileRoute("/auth/auth-code-error")({
	component: AuthCodeErrorPage,
});

function AuthCodeErrorPage() {
	return (
		<AuthCard
			title="Link non valido"
			description="Non è stato possibile confermare la tua email"
		>
			<div className="grid gap-6">
				<div className="flex justify-center">
					<IconStack className="**:data-[slot=icon-stack-layer]:fill-card">
						<DangerCircleIcon className="text-danger h-8 w-8" />
					</IconStack>
				</div>

				<p className="text-muted-foreground text-center text-sm">
					Il link di conferma è scaduto o è già stato utilizzato. Prova a richiedere un
					nuovo link dalla pagina di registrazione.
				</p>

				<div className="grid gap-3">
					<Button asChild size="lg" className="shadow-primary/25 w-full shadow-lg">
						<Link to="/auth/register">Registrati di nuovo</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="w-full">
						<Link to="/auth/login">Vai al login</Link>
					</Button>
				</div>
			</div>
		</AuthCard>
	);
}
