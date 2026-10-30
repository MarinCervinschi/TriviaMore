import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics/track";
import { type LoginInput, loginSchema } from "@/lib/auth/schemas";

export function LoginForm() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const form = useForm<LoginInput>({
		resolver: standardSchemaResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginInput) {
		const result = await login.mutateAsync({ data: values });
		if (result.success) {
			track("accesso", { metodo: "email" });
			toast.success("Accesso effettuato");
			navigate({ to: "/" });
		} else {
			toast.error(result.error);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="nome@esempio.com"
									autoComplete="email"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between">
								<FormLabel>Password</FormLabel>
								<Link
									to="/auth/forgot-password"
									className="text-brand text-sm font-medium underline-offset-4 hover:underline"
								>
									Password dimenticata?
								</Link>
							</div>
							<FormControl>
								<PasswordInput
									placeholder="La tua password"
									autoComplete="current-password"
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
					disabled={login.isPending}
				>
					{login.isPending ? (
						<>
							<Spinner className="mr-2" />
							Accesso in corso...
						</>
					) : (
						"Accedi"
					)}
				</Button>
			</form>
		</Form>
	);
}
