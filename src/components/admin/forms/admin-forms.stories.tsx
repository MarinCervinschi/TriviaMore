import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AdminQuestion } from "@/lib/admin/types";

import { BulkImportForm } from "./bulk-import-form";
import { ClassForm } from "./class-form";
import { CourseForm } from "./course-form";
import { DepartmentForm } from "./department-form";
import { FormSubmitButton } from "./form-submit-button";
import { QuestionForm } from "./question-form";
import { SectionForm } from "./section-form";

// The admin forms, each empty and pre-filled, because the edit path is where a default that never
// arrives shows up. onSubmit is a no-op: the stories are about the form, not the mutation.
const meta = {
	title: "Admin/Forms",
	parameters: { layout: "padded", session: { role: "SUPERADMIN" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};
const now = "2026-08-13T09:00:00.000Z";

const DEPARTMENT = {
	id: "d1",
	name: "Ingegneria Enzo Ferrari",
	code: "DIEF",
	description: "Ingegneria informatica, meccanica e dei materiali.",
	area: "TECNOLOGIA" as const,
	position: 0,
	createdAt: now,
	updatedAt: now,
};

const COURSE = {
	id: "c1",
	name: "Ingegneria Informatica",
	code: "INF",
	description: "Corso di laurea triennale.",
	departmentId: "d1",
	location: "MODENA" as const,
	cfu: 180,
	position: 0,
	courseType: "BACHELOR" as const,
	createdAt: now,
	updatedAt: now,
};

const QUESTION: AdminQuestion = {
	id: "q1",
	content: "Quale struttura garantisce ricerca in O(log n)?",
	questionType: "MULTIPLE_CHOICE",
	options: ["Lista concatenata", "Albero AVL", "Array non ordinato"],
	correctAnswer: ["Albero AVL"],
	explanation: "Un AVL resta bilanciato in altezza.",
	difficulty: "MEDIUM",
	sectionId: "s1",
	createdAt: now,
	updatedAt: now,
} as AdminQuestion;

export const Department: Story = {
	name: "Dipartimento",
	render: () => (
		<div className="grid max-w-5xl gap-10 lg:grid-cols-2">
			<DepartmentForm onSubmit={noop} isPending={false} />
			<DepartmentForm department={DEPARTMENT} onSubmit={noop} isPending={false} />
		</div>
	),
};

export const Course: Story = {
	name: "Corso",
	render: () => (
		<div className="grid max-w-5xl gap-10 lg:grid-cols-2">
			<CourseForm departmentId="d1" onSubmit={noop} isPending={false} />
			<CourseForm course={COURSE} departmentId="d1" onSubmit={noop} isPending={false} />
		</div>
	),
};

export const Class: Story = {
	name: "Insegnamento",
	render: () => (
		<div className="grid max-w-5xl gap-10 lg:grid-cols-2">
			<ClassForm onSubmit={noop} isPending={false} />
			<ClassForm
				cls={{
					name: "Analisi matematica I",
					description: "Calcolo di una variabile.",
					cfu: 9,
				}}
				junction={{ code: "INF-001", class_year: 1, mandatory: true }}
				onSubmit={noop}
				isPending={false}
			/>
		</div>
	),
};

/** A MAINTAINER cannot change visibility, and a private section is not theirs to create. */
export const Section: Story = {
	name: "Sezione",
	render: () => (
		<div className="grid max-w-5xl gap-10 lg:grid-cols-2">
			<SectionForm classId="cl1" onSubmit={noop} isPending={false} />
			<SectionForm
				classId="cl1"
				section={{
					name: "Alberi binari",
					description: "Visite, bilanciamento, rotazioni.",
					isPublic: false,
					classId: "cl1",
				}}
				onSubmit={noop}
				isPending={false}
				canEditVisibility={false}
			/>
		</div>
	),
};

/** The type picker rebuilds the answer fields under it, which is the interesting part. */
export const Question: Story = {
	name: "Domanda",
	render: () => (
		<div className="grid max-w-6xl gap-10 xl:grid-cols-2">
			<QuestionForm sectionId="s1" onSubmit={noop} isPending={false} />
			<QuestionForm
				question={QUESTION}
				sectionId="s1"
				onSubmit={noop}
				isPending={false}
			/>
		</div>
	),
};

export const BulkImport: Story = {
	name: "Importazione in blocco",
	render: () => (
		<div className="max-w-3xl">
			<BulkImportForm sectionId="s1" onSubmit={noop} isPending={false} />
		</div>
	),
};

export const SubmitButton: Story = {
	name: "Il bottone d'invio",
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<FormSubmitButton isPending={false} isEdit={false} entityLabel="dipartimento" />
			<FormSubmitButton isPending={false} isEdit entityLabel="dipartimento" />
			<FormSubmitButton isPending isEdit={false} entityLabel="dipartimento" />
			<FormSubmitButton isPending isEdit entityLabel="dipartimento" />
		</div>
	),
};
