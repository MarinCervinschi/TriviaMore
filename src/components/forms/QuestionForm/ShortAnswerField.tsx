import type { Control } from "react-hook-form";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionInput, UpdateQuestionInput } from "@/lib/validations/admin";

interface ShortAnswerFieldProps {
	control: Control<QuestionInput | UpdateQuestionInput>;
	isLoading?: boolean;
}

export function ShortAnswerField({
	control,
	isLoading = false,
}: ShortAnswerFieldProps) {
	return (
		<FormField
			control={control}
			name="correctAnswer.0"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Risposta Corretta *</FormLabel>
					<FormControl>
						<Textarea
							placeholder="Inserisci la risposta corretta..."
							className="min-h-[120px]"
							{...field}
							disabled={isLoading}
						/>
					</FormControl>
					<FormDescription>
						Puoi utilizzare markdown per formattare la risposta (formule, codice, ecc.)
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
