import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
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

export function ResetPasswordForm({ token }: { token: string }) {
	const navigate = useNavigate();
	const reset = useMutation({ mutationFn: resetPasswordFn });

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
		toast.success("Password cambiata. Accedi con la nuova password.");
		navigate({ to: "/auth/login" });
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nuova password</FormLabel>
							<FormControl>
								<PasswordInput autoComplete="new-password" {...field} />
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
							<FormLabel>Conferma la nuova password</FormLabel>
							<FormControl>
								<PasswordInput autoComplete="new-password" {...field} />
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
						"Cambia password"
					)}
				</Button>
			</form>
		</Form>
	);
}
