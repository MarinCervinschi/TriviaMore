import { useState } from "react";

import { UploadMinimalisticIcon } from "@solar-icons/react/linear/upload-minimalistic";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BulkQuestion = {
	content: string;
	question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options?: string[] | null;
	correct_answer: string[];
	explanation?: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	section_id: string;
};

type BulkImportFormProps = {
	sectionId: string;
	onSubmit: (questions: BulkQuestion[]) => void;
	isPending: boolean;
};

const EXAMPLE = `[
  {
    "content": "Qual è la capitale d'Italia?",
    "question_type": "MULTIPLE_CHOICE",
    "options": ["Roma", "Milano", "Napoli", "Torino"],
    "correct_answer": ["Roma"],
    "difficulty": "EASY"
  },
  {
    "content": "Il sole è una stella",
    "question_type": "TRUE_FALSE",
    "options": ["Vero", "Falso"],
    "correct_answer": ["Vero"],
    "difficulty": "EASY"
  }
]`;

export function BulkImportForm({
	sectionId,
	onSubmit,
	isPending,
}: BulkImportFormProps) {
	const [json, setJson] = useState("");
	const [error, setError] = useState<string | null>(null);

	function handleSubmit() {
		setError(null);
		try {
			const parsed = JSON.parse(json);
			if (!Array.isArray(parsed)) {
				setError("Il JSON deve essere un array di domande");
				return;
			}
			if (parsed.length === 0) {
				setError("L'array è vuoto");
				return;
			}

			const questions: BulkQuestion[] = parsed.map((q: Record<string, unknown>) => ({
				content: q.content as string,
				question_type: q.question_type as BulkQuestion["question_type"],
				options: (q.options as string[] | null) ?? null,
				correct_answer: q.correct_answer as string[],
				explanation: (q.explanation as string) || undefined,
				difficulty: q.difficulty as BulkQuestion["difficulty"],
				section_id: sectionId,
			}));

			onSubmit(questions);
		} catch {
			setError("JSON non valido. Controlla la sintassi.");
		}
	}

	return (
		<div className="grid gap-4">
			<div>
				<Label>JSON domande</Label>
				<p className="text-muted-foreground mb-2 text-sm">
					Incolla un array JSON di domande. Ogni domanda deve avere:{" "}
					<code>content</code>, <code>question_type</code>, <code>correct_answer</code>,{" "}
					<code>difficulty</code>.
				</p>
				<Textarea
					placeholder={EXAMPLE}
					rows={12}
					value={json}
					onChange={e => setJson(e.target.value)}
					className="font-mono text-sm"
				/>
				{error && <p className="text-danger mt-1 text-sm">{error}</p>}
			</div>

			<Button onClick={handleSubmit} disabled={isPending || !json.trim()}>
				<UploadMinimalisticIcon className="mr-2 h-4 w-4" />
				{isPending ? "Importazione..." : "Importa domande"}
			</Button>
		</div>
	);
}
