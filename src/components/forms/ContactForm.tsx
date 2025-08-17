"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type ContactInput,
	contactSchema,
	contactTypeOptions,
} from "@/lib/validations/contact";

interface ContactFormProps {
	onSubmit: (data: ContactInput) => Promise<void>;
	isLoading?: boolean;
}

export function ContactForm({ onSubmit, isLoading = false }: ContactFormProps) {
	const form = useForm<ContactInput>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
			type: "general",
		},
	});

	const handleSubmit = async (data: ContactInput) => {
		try {
			await onSubmit(data);
			form.reset();
			toast.success("Messaggio inviato con successo!");
		} catch (error) {
			console.error("Error submitting contact form:", error);
			toast.error(
				error instanceof Error ? error.message : "Errore nell'invio del messaggio"
			);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nome Completo *</FormLabel>
							<FormControl>
								<Input
									placeholder="Il tuo nome e cognome"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email *</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="la-tua-email@esempio.com"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo di Richiesta *</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Seleziona il tipo di richiesta" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{contactTypeOptions.map(option => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="subject"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Oggetto *</FormLabel>
							<FormControl>
								<Input
									placeholder="Oggetto del messaggio"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Messaggio *</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Scrivi qui il tuo messaggio..."
									className="min-h-[150px]"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading && <LoadingSpinner size="sm" />}
						Invia Messaggio
					</Button>
				</div>
			</form>
		</Form>
	);
}
