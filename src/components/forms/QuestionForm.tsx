"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
	type QuestionInput,
	type UpdateQuestionInput,
	questionSchema,
	updateQuestionSchema,
} from "@/lib/validations/admin";

interface Section {
	id: string;
	name: string;
	class: {
		name: string;
		code: string;
		course: {
			name: string;
			code: string;
		};
	};
}

// Form-specific type that ensures arrays are present
type QuestionFormData = {
	content: string;
	questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options: string[];
	correctAnswer: string[];
	explanation: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	sectionId: string;
};

interface QuestionFormProps {
	mode: "create" | "edit";
	initialData?: Partial<QuestionFormData>;
	sections: Section[];
	onSubmit: (data: QuestionInput | UpdateQuestionInput) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

export function QuestionForm({
	mode,
	initialData,
	sections,
	onSubmit,
	onCancel,
	isLoading = false,
}: QuestionFormProps) {
	const [optionCount, setOptionCount] = useState(initialData?.options?.length || 2);
	const [answerCount, setAnswerCount] = useState(
		initialData?.correctAnswer?.length || 1
	);

	const form = useForm<QuestionFormData>({
		defaultValues: {
			content: initialData?.content || "",
			questionType: initialData?.questionType || "MULTIPLE_CHOICE",
			options: initialData?.options || ["", ""],
			correctAnswer: initialData?.correctAnswer || [""],
			explanation: initialData?.explanation || "",
			difficulty: initialData?.difficulty || "MEDIUM",
			sectionId: initialData?.sectionId || "",
		},
	});

	const questionType = form.watch("questionType");

	const appendOption = () => {
		if (optionCount < 6) {
			setOptionCount(optionCount + 1);
			const currentOptions = form.getValues("options");
			form.setValue("options", [...currentOptions, ""]);
		}
	};

	const removeOption = (index: number) => {
		if (optionCount > 2) {
			setOptionCount(optionCount - 1);
			const currentOptions = form.getValues("options");
			const newOptions = currentOptions.filter((_, i) => i !== index);
			form.setValue("options", newOptions);
		}
	};

	const appendAnswer = () => {
		if (answerCount < 6) {
			setAnswerCount(answerCount + 1);
			const currentAnswers = form.getValues("correctAnswer");
			form.setValue("correctAnswer", [...currentAnswers, ""]);
		}
	};

	const removeAnswer = (index: number) => {
		if (answerCount > 1) {
			setAnswerCount(answerCount - 1);
			const currentAnswers = form.getValues("correctAnswer");
			const newAnswers = currentAnswers.filter((_, i) => i !== index);
			form.setValue("correctAnswer", newAnswers);
		}
	};

	const handleSubmit = async (data: QuestionFormData) => {
		try {
			// Manual validation based on question type
			let validatedData: QuestionInput | UpdateQuestionInput;

			if (mode === "create") {
				// Validate with create schema
				const schema = questionSchema;

				// Prepare data based on question type
				if (data.questionType === "TRUE_FALSE") {
					data.options = ["Vero", "Falso"];
				} else if (data.questionType === "SHORT_ANSWER") {
					const { options, ...dataWithoutOptions } = data;
					validatedData = schema.parse(dataWithoutOptions);
				} else {
					validatedData = schema.parse(data);
				}
			} else {
				// Validate with update schema
				const schema = updateQuestionSchema;

				// Prepare data based on question type
				if (data.questionType === "TRUE_FALSE") {
					data.options = ["Vero", "Falso"];
				} else if (data.questionType === "SHORT_ANSWER") {
					const { options, ...dataWithoutOptions } = data;
					const { sectionId, ...updateData } = dataWithoutOptions;
					validatedData = schema.parse(updateData);
				} else {
					const { sectionId, ...updateData } = data;
					validatedData = schema.parse(updateData);
				}
			}

			await onSubmit(validatedData!);
		} catch (error) {
			console.error("Error submitting question form:", error);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contenuto Domanda *</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Inserisci il testo della domanda..."
									className="min-h-[120px]"
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
					name="questionType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo Domanda *</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Seleziona il tipo di domanda" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="MULTIPLE_CHOICE">Scelta Multipla</SelectItem>
									<SelectItem value="TRUE_FALSE">Vero/Falso</SelectItem>
									<SelectItem value="SHORT_ANSWER">Risposta Breve</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{mode === "create" && (
					<FormField
						control={form.control}
						name="sectionId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Sezione *</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleziona una sezione" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{sections.map(section => (
											<SelectItem key={section.id} value={section.id}>
												{section.name} - {section.class.name} (
												{section.class.course.name})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{questionType === "MULTIPLE_CHOICE" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<FormLabel>Opzioni di Risposta *</FormLabel>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={appendOption}
								disabled={isLoading || optionCount >= 6}
							>
								<Plus className="h-4 w-4" />
								Aggiungi Opzione
							</Button>
						</div>

						{Array.from({ length: optionCount }, (_, index) => (
							<div key={index} className="flex gap-2">
								<FormField
									control={form.control}
									name={`options.${index}` as const}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input
													placeholder={`Opzione ${index + 1}`}
													{...field}
													disabled={isLoading}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{optionCount > 2 && (
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => removeOption(index)}
										disabled={isLoading}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
					</div>
				)}

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<FormLabel>Risposte Corrette *</FormLabel>
						{questionType === "MULTIPLE_CHOICE" && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={appendAnswer}
								disabled={isLoading || answerCount >= 6}
							>
								<Plus className="h-4 w-4" />
								Aggiungi Risposta
							</Button>
						)}
					</div>

					{Array.from({ length: answerCount }, (_, index) => (
						<div key={index} className="flex gap-2">
							<FormField
								control={form.control}
								name={`correctAnswer.${index}` as const}
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											{questionType === "TRUE_FALSE" ? (
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
													disabled={isLoading}
												>
													<SelectTrigger>
														<SelectValue placeholder="Seleziona la risposta corretta" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Vero">Vero</SelectItem>
														<SelectItem value="Falso">Falso</SelectItem>
													</SelectContent>
												</Select>
											) : (
												<Input
													placeholder={
														questionType === "MULTIPLE_CHOICE"
															? "Risposta corretta"
															: "Risposta breve"
													}
													{...field}
													disabled={isLoading}
												/>
											)}
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{questionType === "MULTIPLE_CHOICE" && answerCount > 1 && (
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => removeAnswer(index)}
									disabled={isLoading}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
				</div>

				<FormField
					control={form.control}
					name="difficulty"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Difficoltà *</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Seleziona la difficoltà" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="EASY">Facile</SelectItem>
									<SelectItem value="MEDIUM">Medio</SelectItem>
									<SelectItem value="HARD">Difficile</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="explanation"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Spiegazione</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Spiegazione della risposta corretta (opzionale)..."
									className="min-h-[100px]"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormDescription>
								Fornisci una spiegazione per aiutare gli studenti a comprendere la
								risposta corretta.
							</FormDescription>
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
						{mode === "create" ? "Crea Domanda" : "Salva Modifiche"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
