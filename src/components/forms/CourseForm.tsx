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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type CourseInput,
	type UpdateCourseInput,
	courseSchema,
	updateCourseSchema,
} from "@/lib/validations/admin";

interface Department {
	id: string;
	name: string;
	code: string;
}

interface CourseFormProps {
	mode: "create" | "edit";
	initialData?: Partial<CourseInput>;
	departments: Department[];
	onSubmit: (data: CourseInput | UpdateCourseInput) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function CourseForm({
	mode,
	initialData,
	departments,
	onSubmit,
	onCancel,
	isLoading = false,
}: CourseFormProps) {
	const schema = mode === "create" ? courseSchema : updateCourseSchema;

	const form = useForm<CourseInput | UpdateCourseInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialData?.name || "",
			code: initialData?.code || "",
			description: initialData?.description || "",
			departmentId: initialData?.departmentId || "",
			courseType: initialData?.courseType || "BACHELOR",
			position: initialData?.position || 0,
		},
	});

	const handleSubmit = async (data: CourseInput | UpdateCourseInput) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting course form:", error);
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
							<FormLabel>Nome Corso *</FormLabel>
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
							<FormLabel>Codice Corso *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. 20-312"
									{...field}
									onChange={e => field.onChange(e.target.value.toUpperCase())}
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
						name="departmentId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Dipartimento *</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleziona un dipartimento" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{departments.map(dept => (
											<SelectItem key={dept.id} value={dept.id}>
												{dept.name} ({dept.code})
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
					name="courseType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo Corso *</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Seleziona il tipo di corso" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="BACHELOR">Laurea Triennale</SelectItem>
									<SelectItem value="MASTER">Laurea Magistrale</SelectItem>
								</SelectContent>
							</Select>
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
									placeholder="Descrizione del corso..."
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
						{mode === "create" ? "Crea Corso" : "Salva Modifiche"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
