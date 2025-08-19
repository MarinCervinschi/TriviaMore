"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	type QuestionInput,
	type UpdateQuestionInput,
	questionSchema,
	updateQuestionSchema,
} from "@/lib/validations/admin";

import { MultipleChoiceAnswers } from "./MultipleChoiceAnswers";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { QuestionPreview } from "./QuestionPreview";
import { ShortAnswerField } from "./ShortAnswerField";

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

interface QuestionFormProps {
	mode: "create" | "edit";
	initialData?: Partial<QuestionInput>;
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
	const schema = mode === "create" ? questionSchema : updateQuestionSchema;

	const preprocessQuestion = (data: any) => {
		if (data.questionType === "TRUE_FALSE") {
			data.options = ["Vero", "Falso"];
		} else if (data.questionType === "SHORT_ANSWER") {
			data.options = undefined;
			if (data.correctAnswer && data.correctAnswer.length > 1) {
				data.correctAnswer = [data.correctAnswer[0]];
			}
		}
		return data;
	};
	const form = useForm<QuestionInput | UpdateQuestionInput>({
		resolver: async (values, isContext, options) => {
			const processed = preprocessQuestion({ ...values });
			return zodResolver(schema)(processed, isContext, options);
		},
		defaultValues: {
			content: initialData?.content || "",
			questionType: initialData?.questionType || "MULTIPLE_CHOICE",
			options: initialData?.options || ["", ""],
			correctAnswer: initialData?.correctAnswer || [],
			explanation: initialData?.explanation || "",
			difficulty: initialData?.difficulty || "MEDIUM",
			sectionId: initialData?.sectionId || "",
		},
	});

	const questionType = form.watch("questionType");

	const handleSubmit = async (data: QuestionInput | UpdateQuestionInput) => {
		console.log("Form submit event with", data);
		try {
			await onSubmit(data);
		} catch (error) {
			console.error("Error submitting question form:", error);
			toast.error(error instanceof Error ? error.message : "Errore sconosciuto");
		}
	};

	return (
		<div className="space-y-6">
			<Tabs defaultValue="form" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="form">Modifica</TabsTrigger>
					<TabsTrigger value="preview">Anteprima</TabsTrigger>
				</TabsList>

				<TabsContent value="form" className="space-y-6">
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
								<>
									<MultipleChoiceOptions form={form} initialData={initialData} isLoading={isLoading} />
									<MultipleChoiceAnswers control={form.control} isLoading={isLoading} />
								</>
							)}

							{questionType === "SHORT_ANSWER" && (
								<ShortAnswerField control={form.control} isLoading={isLoading} />
							)}

							{questionType === "TRUE_FALSE" && (
								<FormField
									control={form.control}
									name="correctAnswer.0"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Risposta Corretta *</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												disabled={isLoading}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Seleziona la risposta corretta" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="Vero">Vero</SelectItem>
													<SelectItem value="Falso">Falso</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

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
					{Object.keys(form.formState.errors).length > 0 && (
						<pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
					)}
				</TabsContent>

				<TabsContent value="preview">
					<QuestionPreview control={form.control} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
