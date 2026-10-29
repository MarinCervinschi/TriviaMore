import { useState } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
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
import { requestPasswordResetFn } from "@/lib/auth/api";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/lib/auth/schemas";

export function ForgotPasswordForm() {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const request = useMutation({ mutationFn: requestPasswordResetFn });

	const form = useForm<ForgotPasswordInput>({
		resolver: standardSchemaResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	async function onSubmit(values: ForgotPasswordInput) {
		const result = await request.mutateAsync({ data: values });
		if (result.success) setSentTo(values.email);
		else toast.error(result.error);
	}

	if (sentTo) {
		return (
			<p className="text-muted-foreground text-center text-sm">
				Se <span className="text-foreground font-semibold">{sentTo}</span> ha un account
				con password, riceverai un link per sceglierne una nuova. Il link scade tra 60
				minuti.
			</p>
		);
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
				<Button
					type="submit"
					size="lg"
					className="shadow-primary/25 w-full shadow-lg"
					disabled={request.isPending}
				>
					{request.isPending ? (
						<>
							<Spinner className="mr-2" />
							Invio in corso...
						</>
					) : (
						"Invia il link"
					)}
				</Button>
			</form>
		</Form>
	);
}
