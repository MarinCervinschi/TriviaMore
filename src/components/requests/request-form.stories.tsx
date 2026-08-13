import { useState } from "react";

import { AddFolderIcon } from "@solar-icons/react/linear/add-folder";
import { ChatRoundDotsIcon } from "@solar-icons/react/linear/chat-round-dots";
import { CloudUploadIcon } from "@solar-icons/react/linear/cloud-upload";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import type { SubmittedQuestion } from "@/lib/requests/types";

import { FileUploadForm } from "./file-upload-form";
import { QuestionEditor } from "./question-editor";
import { RequestForm } from "./request-form";
import { RequestFormDialog } from "./request-form-dialog";
import { SearchableSelect } from "./searchable-select";
import { TypeCard } from "./type-card";

// Proposing content. The form reaches the catalog and the create mutation through server functions, so
// none of this had a story before the stub — and the empty content tree is what a story shows that the
// app rarely does.
const meta = {
	title: "Requests/Form",
	parameters: { layout: "padded", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
	name: "Il form",
	render: () => (
		<div className="max-w-3xl">
			<RequestForm />
		</div>
	),
};

export const InDialog: Story = {
	name: "Nel dialog",
	parameters: { layout: "centered" },
	render: () => <RequestFormDialog trigger={<Button>Proponi contenuto</Button>} />,
};

function Types() {
	const [selected, setSelected] = useState("section");
	const types = [
		{
			id: "section",
			icon: AddFolderIcon,
			title: "Nuova sezione",
			description: "Proponi una sezione per un insegnamento.",
		},
		{
			id: "questions",
			icon: ChatRoundDotsIcon,
			title: "Nuove domande",
			description: "Aggiungi domande a una sezione esistente.",
		},
		{
			id: "file",
			icon: CloudUploadIcon,
			title: "Carica un file",
			description: "Manda appunti o una raccolta di esercizi.",
		},
	];
	return (
		<div className="grid max-w-4xl gap-4 sm:grid-cols-3">
			{types.map(type => (
				<TypeCard
					key={type.id}
					icon={type.icon}
					title={type.title}
					description={type.description}
					selected={selected === type.id}
					onClick={() => setSelected(type.id)}
				/>
			))}
		</div>
	);
}

export const Types_: Story = { name: "La scelta del tipo", render: () => <Types /> };

function Editor() {
	const [question, setQuestion] = useState<SubmittedQuestion>({
		content: "Quale struttura garantisce ricerca in O(log n)?",
		question_type: "MULTIPLE_CHOICE",
		options: ["Lista concatenata", "Albero AVL", "Array non ordinato"],
		correct_answer: ["Albero AVL"],
		explanation: "Un AVL resta bilanciato in altezza.",
		difficulty: "MEDIUM",
	});
	const [empty, setEmpty] = useState<SubmittedQuestion>({
		content: "",
		question_type: "TRUE_FALSE",
		options: null,
		correct_answer: [],
		explanation: null,
		difficulty: "EASY",
	});
	return (
		<div className="max-w-3xl space-y-8">
			<QuestionEditor
				index={0}
				question={question}
				onChange={setQuestion}
				onRemove={() => {}}
			/>
			<QuestionEditor index={1} question={empty} onChange={setEmpty} />
		</div>
	);
}

/** Filled and empty, and the second without onRemove — the only question cannot be removed. */
export const Editor_: Story = { name: "L'editor di domanda", render: () => <Editor /> };

function Upload() {
	const [file, setFile] = useState<File | null>(null);
	const [comment, setComment] = useState("");
	return (
		<div className="max-w-2xl">
			<FileUploadForm
				file={file}
				onFileChange={setFile}
				comment={comment}
				onCommentChange={setComment}
			/>
		</div>
	);
}

export const Upload_: Story = { name: "Il caricamento file", render: () => <Upload /> };

function Select() {
	const [value, setValue] = useState("");
	return (
		<div className="max-w-md space-y-6">
			<SearchableSelect
				items={[
					{ value: "1", label: "Analisi matematica I" },
					{ value: "2", label: "Algoritmi e strutture dati" },
					{ value: "3", label: "Basi di dati" },
					{ value: "4", label: "Reti di calcolatori" },
				]}
				value={value}
				onValueChange={setValue}
				placeholder="Scegli un insegnamento"
			/>
			<SearchableSelect
				items={[]}
				value=""
				onValueChange={() => {}}
				placeholder="Nessuna opzione disponibile"
			/>
		</div>
	);
}

/** The second has no options at all, which is the state a fresh catalog produces. */
export const Select_: Story = { name: "La select cercabile", render: () => <Select /> };
