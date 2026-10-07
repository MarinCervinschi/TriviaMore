import { type FormEvent, useState } from "react";

import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { GoogleIcon, Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InsetCard } from "@/components/ui/inset-card";
import { Label } from "@/components/ui/label";
import { LogoIcon } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";

import { getSessionFn, googleSignInFn, loginFn } from "~/lib/auth/api";
import type { OAuthFailure } from "~/lib/auth/types";

const OAUTH_ERRORS: Record<OAuthFailure, string> = {
	"not-owner": "Questo account non può accedere alla console.",
	failed: "Accesso con Google non riuscito.",
};

// Only a path inside the console, so the parameter cannot send the owner to another site.
const internalPath = z
	.string()
	.refine(path => path.startsWith("/") && !path.startsWith("//"))
	.optional()
	.catch(undefined);

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: internalPath,
		error: z.enum(["not-owner", "failed"]).optional().catch(undefined),
	}),
	beforeLoad: async ({ search }) => {
		if (await getSessionFn()) throw redirect({ to: search.redirect ?? "/" });
	},
	head: () => ({ meta: [{ title: "Accesso · Console" }] }),
	component: LoginPage,
});

function LoginPage() {
	const router = useRouter();
	const { redirect: target, error: oauthError } = Route.useSearch();
	const [error, setError] = useState<string | null>(
		oauthError ? OAUTH_ERRORS[oauthError] : null
	);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		setPending(true);
		setError(null);
		try {
			const result = await loginFn({
				data: {
					email: String(form.get("email")),
					password: String(form.get("password")),
				},
			});
			if (!result.success) {
				setError(result.error);
				return;
			}
			await router.invalidate();
			await router.navigate({ to: target ?? "/" });
		} catch {
			setError("Accesso non riuscito. Controlla email e password.");
		} finally {
			setPending(false);
		}
	}

	async function signInWithGoogle() {
		setPending(true);
		setError(null);
		const result = await googleSignInFn();
		if (!result.success) {
			setError(result.error);
			setPending(false);
			return;
		}
		window.location.assign(result.url);
	}

	return (
		<main
			id="main-content"
			className="bg-sidebar flex min-h-svh items-center justify-center px-4"
		>
			<InsetCard className="w-full max-w-sm">
				<form onSubmit={onSubmit} className="space-y-5 p-6">
					<div className="space-y-1 text-center">
						<LogoIcon size={32} className="mx-auto" />
						<h1 className="pt-2 text-lg font-semibold">Console di TriviaMore</h1>
						<p className="text-muted-foreground text-sm">
							Accedi con l'account del proprietario.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" name="email" type="email" autoComplete="email" required />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<PasswordInput
							id="password"
							name="password"
							autoComplete="current-password"
							required
						/>
					</div>

					{error && (
						<p role="alert" className="text-danger text-sm">
							{error}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={pending}>
						{pending && <Spinner />}
						{pending ? "Accesso in corso…" : "Accedi"}
					</Button>

					<div className="text-muted-foreground flex items-center gap-3 text-xs">
						<span className="bg-border h-px flex-1" />
						oppure
						<span className="bg-border h-px flex-1" />
					</div>

					<Button
						type="button"
						variant="outline"
						className="w-full"
						disabled={pending}
						onClick={() => void signInWithGoogle()}
					>
						<GoogleIcon className="size-4" />
						Continua con Google
					</Button>
				</form>
			</InsetCard>
		</main>
	);
}
