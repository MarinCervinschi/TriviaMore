"use client";

import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";
import { type Control, UseFormReturn, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { QuestionInput, UpdateQuestionInput } from "@/lib/validations/admin";

interface MultipleChoiceOptionsProps {
	form: UseFormReturn<QuestionInput | UpdateQuestionInput>;
	initialData?: Partial<QuestionInput>;
	isLoading?: boolean;
}

export function MultipleChoiceOptions({
	form,
	initialData,
	isLoading = false,
}: MultipleChoiceOptionsProps) {
	const [optionCount, setOptionCount] = useState(initialData?.options?.length || 2);

	const appendOption = () => {
		if (optionCount < 6) {
			setOptionCount(optionCount + 1);
			const currentOptions = form.getValues("options") ?? [];
			form.setValue("options", [...currentOptions, ""]);
		}
	};

	const removeOption = (index: number) => {
		if (optionCount > 2) {
			setOptionCount(optionCount - 1);
			const currentOptions = form.getValues("options") ?? [];
			const newOptions = currentOptions.filter((_, i) => i !== index);
			form.setValue("options", newOptions);
		}
	};

	return (
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
	);
}
