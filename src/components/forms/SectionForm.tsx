"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
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
	type SectionInput,
	type UpdateSectionInput,
	sectionSchema,
	updateSectionSchema,
} from "@/lib/validations/admin";

interface Class {
	id: string;
	name: string;
	code: string;
	course: {
		name: string;
		code: string;
		department: {
			name: string;
			code: string;
		};
	};
}

interface SectionFormProps {
	mode: "create" | "edit";
	initialData?: Partial<SectionInput>;
	classes: Class[];
	onSubmit: (data: SectionInput | UpdateSectionInput) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function SectionForm({
	mode,
	initialData,
	classes,
	onSubmit,
	onCancel,
	isLoading = false,
}: SectionFormProps) {
	const schema = mode === "create" ? sectionSchema : updateSectionSchema;

	const form = useForm<SectionInput | UpdateSectionInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
			classId: initialData?.classId || "",
			isPublic: initialData?.isPublic ?? true,
			position: initialData?.position || 0,
		},
	});

	const handleSubmit = async (data: SectionInput | UpdateSectionInput) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting section form:", error);
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
							<FormLabel>Nome Sezione *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. Introduzione al JavaScript"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{mode === "create" && (
					<FormField
						control={form.control}
						name="classId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Classe *</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleziona una classe" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{classes.map(cls => (
											<SelectItem key={cls.id} value={cls.id}>
												{cls.name} ({cls.code}) - {cls.course.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrizione</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Descrizione della sezione..."
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
					name="isPublic"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isLoading}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Sezione Pubblica</FormLabel>
								<FormDescription>
									Se abilitata, la sezione sarà visibile a tutti gli utenti. Altrimenti
									sarà visibile solo agli utenti autorizzati.
								</FormDescription>
							</div>
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
						{mode === "create" ? "Crea Sezione" : "Salva Modifiche"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
