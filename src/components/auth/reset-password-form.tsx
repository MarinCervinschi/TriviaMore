import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPasswordFn } from "@/lib/auth/api";
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/auth/schemas";

export type PasswordFormVariant = "signup" | "reset";

const COPY: Record<
	PasswordFormVariant,
	{ password: string; confirm: string; submit: string }
> = {
	signup: {
		password: "Password",
		confirm: "Conferma la password",
		submit: "Salva e accedi",
	},
	reset: {
		password: "Nuova password",
		confirm: "Conferma la nuova password",
		submit: "Cambia password",
	},
};

export function ResetPasswordForm({
	token,
	variant = "reset",
}: {
	token: string;
	variant?: PasswordFormVariant;
}) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const reset = useMutation({ mutationFn: resetPasswordFn });
	const copy = COPY[variant];

	const form = useForm<ResetPasswordInput>({
		resolver: standardSchemaResolver(resetPasswordSchema),
		defaultValues: { token, password: "", password_confirm: "" },
	});

	async function onSubmit(values: ResetPasswordInput) {
		const result = await reset.mutateAsync({ data: values });
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		if (!result.signedIn) {
			toast.success("Password salvata. Accedi con la nuova password.");
			navigate({ to: "/auth/login" });
			return;
		}
		await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
		toast.success(result.newAccount ? "Account attivato" : "Password cambiata");
		navigate({ to: result.newAccount ? "/onboarding" : "/" });
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{copy.password}</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="Min. 6 caratteri, maiuscola e numero"
									autoComplete="new-password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password_confirm"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{copy.confirm}</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="Ripeti la password"
									autoComplete="new-password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					size="lg"
					className="shadow-primary/25 w-full shadow-lg"
					disabled={reset.isPending}
				>
					{reset.isPending ? (
						<>
							<Spinner className="mr-2" />
							Salvataggio...
						</>
					) : (
						copy.submit
					)}
				</Button>
			</form>
		</Form>
	);
}
