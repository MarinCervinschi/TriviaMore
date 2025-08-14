"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import {
	type DepartmentInput,
	type UpdateDepartmentInput,
	departmentSchema,
	updateDepartmentSchema,
} from "@/lib/validations/admin";

interface DepartmentFormProps {
	mode: "create" | "edit";
	initialData?: Partial<DepartmentInput>;
	onSubmit: (data: DepartmentInput | UpdateDepartmentInput) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function DepartmentForm({
	mode,
	initialData,
	onSubmit,
	onCancel,
	isLoading = false,
}: DepartmentFormProps) {
	const schema = mode === "create" ? departmentSchema : updateDepartmentSchema;

	const form = useForm<DepartmentInput | UpdateDepartmentInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialData?.name || "",
			code: initialData?.code || "",
			description: initialData?.description || "",
			position: initialData?.position || 0,
		},
	});

	const handleSubmit = async (data: DepartmentInput | UpdateDepartmentInput) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting department form:", error);
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
							<FormLabel>Nome Dipartimento *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. Ingegneria Informatica"
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
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Codice Dipartimento *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. ING-INF"
									{...field}
									onChange={e => field.onChange(e.target.value.toUpperCase())}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrizione</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Descrizione del dipartimento..."
									className="min-h-[100px]"
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
					name="position"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Posizione</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="0"
									placeholder="0"
									{...field}
									onChange={e => field.onChange(Number(e.target.value))}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
					>
						Annulla
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading && <LoadingSpinner size="sm" />}
						{mode === "create" ? "Crea Dipartimento" : "Salva Modifiche"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
