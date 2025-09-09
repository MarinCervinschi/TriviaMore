import { type Control, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { QuestionInput, UpdateQuestionInput } from "@/lib/validations/admin";

interface MultipleChoiceAnswersProps {
	control: Control<QuestionInput | UpdateQuestionInput>;
	isLoading?: boolean;
}

export function MultipleChoiceAnswers({
	control,
	isLoading = false,
}: MultipleChoiceAnswersProps) {
	const options = useWatch({ control, name: "options" }) || [];
	const correctAnswers = useWatch({ control, name: "correctAnswer" }) || [];

	return (
		<div className="space-y-4">
			<FormLabel>Risposte Corrette *</FormLabel>
			<FormField
				control={control}
				name="correctAnswer"
				render={({ field }) => (
					<FormItem>
						<div className="space-y-3">
							{options.map((option: string, index: number) => {
								if (!option.trim()) {return null;}

								const isChecked = correctAnswers.includes(option);

								return (
									<div key={index} className="flex items-center space-x-2">
										<Checkbox
											id={`answer-${index}`}
											checked={isChecked}
											disabled={isLoading}
											onCheckedChange={checked => {
												const currentAnswers = field.value || [];
												if (checked) {
													// Add answer if not already present
													if (!currentAnswers.includes(option)) {
														field.onChange([...currentAnswers, option]);
													}
												} else {
													// Remove answer
													field.onChange(
														currentAnswers.filter((answer: string) => answer !== option)
													);
												}
											}}
										/>
										<label
											htmlFor={`answer-${index}`}
											className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{option}
										</label>
									</div>
								);
							})}
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
