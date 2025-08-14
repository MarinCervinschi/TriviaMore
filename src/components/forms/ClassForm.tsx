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
	type ClassInput,
	type UpdateClassInput,
	classSchema,
	updateClassSchema,
} from "@/lib/validations/admin";

interface Course {
	id: string;
	name: string;
	code: string;
	department: {
		name: string;
		code: string;
	};
}

interface ClassFormProps {
	mode: "create" | "edit";
	initialData?: Partial<ClassInput>;
	courses: Course[];
	onSubmit: (data: ClassInput | UpdateClassInput) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function ClassForm({
	mode,
	initialData,
	courses,
	onSubmit,
	onCancel,
	isLoading = false,
}: ClassFormProps) {
	const schema = mode === "create" ? classSchema : updateClassSchema;

	const form = useForm<ClassInput | UpdateClassInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: initialData?.name || "",
			code: initialData?.code || "",
			description: initialData?.description || "",
			courseId: initialData?.courseId || "",
			classYear: initialData?.classYear || 1,
			position: initialData?.position || 0,
		},
	});

	const handleSubmit = async (data: ClassInput | UpdateClassInput) => {
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting class form:", error);
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
							<FormLabel>Nome Classe *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. Programmazione Web - Anno 2024"
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
							<FormLabel>Codice Classe *</FormLabel>
							<FormControl>
								<Input
									placeholder="es. PROG-WEB-2024"
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
						name="courseId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Corso *</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleziona un corso" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{courses.map(course => (
											<SelectItem key={course.id} value={course.id}>
												{course.name} ({course.code}) - {course.department.name}
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
					name="classYear"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Anno *</FormLabel>
							<Select
								onValueChange={value => field.onChange(Number(value))}
								defaultValue={field.value?.toString()}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Seleziona l'anno" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{Array.from({ length: 5 }, (_, i) => i + 1).map(year => (
										<SelectItem key={year} value={year.toString()}>
											{year}° Anno
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
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrizione</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Descrizione della classe..."
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
						{mode === "create" ? "Crea Classe" : "Salva Modifiche"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
