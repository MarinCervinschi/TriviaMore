import { useEffect, useState } from "react";

import { LetterOpenedIcon } from "@solar-icons/react/linear/letter-opened";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { requireGuestFn } from "@/lib/auth/api";
import { resendConfirmationFn } from "@/lib/auth/api";

const RESEND_COOLDOWN_SECONDS = 60;

type VerifyEmailSearch = {
	email?: string;
};

export const Route = createFileRoute("/auth/verify-email")({
	validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => {
		if (typeof search.email === "string" && search.email) {
			return { email: search.email };
		}
		return {};
	},
	beforeLoad: () => requireGuestFn(),
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	const { email } = Route.useSearch();
	const [cooldown, setCooldown] = useState(0);

	const resend = useMutation({
		mutationFn: resendConfirmationFn,
		onSuccess: result => {
			if (result.success) {
				toast.success("Email inviata di nuovo. Controlla la tua casella di posta.");
				setCooldown(RESEND_COOLDOWN_SECONDS);
			} else {
				toast.error(result.error);
			}
		},
		onError: () => {
			toast.error("Impossibile inviare l'email. Riprova più tardi.");
		},
	});

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => {
			setCooldown(c => (c <= 1 ? 0 : c - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	const canResend = email && cooldown === 0 && !resend.isPending;

	return (
		<AuthCard
			title="Controlla la tua casella di posta"
			description="Ti abbiamo inviato un link di conferma"
		>
			<div className="grid gap-6">
				<div className="flex justify-center">
					<div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl">
						<LetterOpenedIcon className="h-8 w-8" />
					</div>
				</div>

				<div className="text-muted-foreground text-center text-sm">
					{email ? (
						<>
							Abbiamo inviato un link di conferma a{" "}
							<span className="text-foreground font-semibold">{email}</span>. Clicca sul
							link per attivare il tuo account.
						</>
					) : (
						<>
							Clicca sul link che ti abbiamo inviato via email per attivare il tuo
							account.
						</>
					)}
				</div>

				<div className="grid gap-2 text-center">
					<p className="text-muted-foreground text-sm">Non hai ricevuto l'email?</p>
					<Button
						type="button"
						variant="outline"
						size="lg"
						disabled={!canResend}
						onClick={() => {
							if (!email) return;
							resend.mutate({ data: { email } });
						}}
					>
						{resend.isPending ? (
							<>
								<Spinner className="mr-2" />
								Invio in corso...
							</>
						) : cooldown > 0 ? (
							`Reinvia email (${cooldown}s)`
						) : (
							"Reinvia email"
						)}
					</Button>
				</div>

				<p className="text-muted-foreground text-center text-sm">
					<Link
						to="/auth/login"
						className="text-primary font-semibold underline-offset-4 hover:underline"
					>
						Torna al login
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
