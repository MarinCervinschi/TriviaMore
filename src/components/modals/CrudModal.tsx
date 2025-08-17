"use client";

import { useState } from "react";

import { toast } from "sonner";

import { ClassForm } from "@/components/forms/ClassForm";
import { CourseForm } from "@/components/forms/CourseForm";
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import { QuestionForm } from "@/components/forms/QuestionForm/intex";
import { SectionForm } from "@/components/forms/SectionForm";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useEditMutations } from "@/hooks/useEditMutations";
import type {
	ClassInput,
	CourseInput,
	DepartmentInput,
	QuestionInput,
	SectionInput,
	UpdateClassInput,
	UpdateCourseInput,
	UpdateDepartmentInput,
	UpdateQuestionInput,
	UpdateSectionInput,
} from "@/lib/validations/admin";

type CrudModalType = "department" | "course" | "class" | "section" | "question";
type CrudModalMode = "create" | "edit" | "delete";

export interface Modal {
	isOpen: boolean;
	type: CrudModalType;
	mode: CrudModalMode;
	data?: any;
}

interface CrudModalProps {
	type: CrudModalType;
	mode: CrudModalMode;
	isOpen: boolean;
	onClose: () => void;
	initialData?: any;
	contextData?: {
		departments?: any[];
		courses?: any[];
		classes?: any[];
		sections?: any[];
	};
}

export function CrudModal({
	type,
	mode,
	isOpen,
	onClose,
	initialData,
	contextData,
}: CrudModalProps) {
	const mutations = useEditMutations();
	const [isLoading, setIsLoading] = useState(false);

	const getModalTitle = () => {
		const actions = {
			create: "Crea",
			edit: "Modifica",
			delete: "Elimina",
		};

		const entities = {
			department: "Dipartimento",
			course: "Corso",
			class: "Classe",
			section: "Sezione",
			question: "Domanda",
		};

		return `${actions[mode]} ${entities[type]}`;
	};

	const handleSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			switch (type) {
				case "department":
					if (mode === "create") {
						await mutations.createDepartment.mutateAsync({
							nodeType: "department",
							body: data as DepartmentInput,
						});
					} else {
						await mutations.updateDepartment.mutateAsync({
							nodeType: "department",
							id: initialData.id,
							body: data as UpdateDepartmentInput,
						});
					}
					break;
				case "course":
					if (mode === "create") {
						await mutations.createCourse.mutateAsync({
							nodeType: "course",
							body: data as CourseInput,
						});
					} else {
						await mutations.updateCourse.mutateAsync({
							nodeType: "course",
							id: initialData.id,
							body: data as UpdateCourseInput,
						});
					}
					break;
				case "class":
					if (mode === "create") {
						await mutations.createClass.mutateAsync({
							nodeType: "class",
							body: data as ClassInput,
						});
					} else {
						await mutations.updateClass.mutateAsync({
							nodeType: "class",
							id: initialData.id,
							body: data as UpdateClassInput,
						});
					}
					break;
				case "section":
					if (mode === "create") {
						await mutations.createSection.mutateAsync({
							nodeType: "section",
							body: data as SectionInput,
						});
					} else {
						await mutations.updateSection.mutateAsync({
							nodeType: "section",
							id: initialData.id,
							body: data as UpdateSectionInput,
						});
					}
					break;
				case "question":
					if (mode === "create") {
						await mutations.createQuestion.mutateAsync({
							sectionId: initialData.sectionId,
							body: data as QuestionInput,
							many: false,
						});
					} else {
						await mutations.updateQuestion.mutateAsync({
							nodeType: "question",
							id: initialData.id,
							sectionId: initialData.sectionId,
							body: data as UpdateQuestionInput,
						});
					}
					break;
			}
			onClose();
		} catch (error) {
			console.error("Error in CRUD operation:", error);
			toast.error(
				error instanceof Error ? error.message : "Errore durante l'operazione"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			switch (type) {
				case "department":
					await mutations.deleteDepartment.mutateAsync({
						nodeType: "department",
						id: initialData.id,
					});
					break;
				case "course":
					await mutations.deleteCourse.mutateAsync({
						nodeType: "course",
						id: initialData.id,
					});
					break;
				case "class":
					await mutations.deleteClass.mutateAsync({
						nodeType: "class",
						id: initialData.id,
					});
					break;
				case "section":
					await mutations.deleteSection.mutateAsync({
						nodeType: "section",
						id: initialData.id,
					});
					break;
				case "question":
					await mutations.deleteQuestion.mutateAsync({
						nodeType: "question",
						id: initialData.id,
						sectionId: initialData.sectionId,
					});
					break;
			}
			onClose();
		} catch (error) {
			console.error("Error in delete operation:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (mode === "delete") {
		return (
			<ConfirmationDialog
				open={isOpen}
				onOpenChange={onClose}
				title={getModalTitle()}
				description={`Sei sicuro di voler eliminare questo ${type === "department" ? "dipartimento" : type === "course" ? "corso" : type === "class" ? "classe" : type === "section" ? "sezione" : "domanda"}? Questa azione non può essere annullata.`}
				confirmText="Elimina"
				cancelText="Annulla"
				onConfirm={handleDelete}
				variant="destructive"
			/>
		);
	}

	const renderForm = () => {
		switch (type) {
			case "department":
				return (
					<DepartmentForm
						mode={mode as "create" | "edit"}
						initialData={initialData}
						onSubmit={handleSubmit}
						onCancel={onClose}
						isLoading={isLoading}
					/>
				);
			case "course":
				return (
					<CourseForm
						mode={mode as "create" | "edit"}
						initialData={initialData}
						departments={contextData?.departments || []}
						onSubmit={handleSubmit}
						onCancel={onClose}
						isLoading={isLoading}
					/>
				);
			case "class":
				return (
					<ClassForm
						mode={mode as "create" | "edit"}
						initialData={initialData}
						courses={contextData?.courses || []}
						onSubmit={handleSubmit}
						onCancel={onClose}
						isLoading={isLoading}
					/>
				);
			case "section":
				return (
					<SectionForm
						mode={mode as "create" | "edit"}
						initialData={initialData}
						classes={contextData?.classes || []}
						onSubmit={handleSubmit}
						onCancel={onClose}
						isLoading={isLoading}
					/>
				);
			case "question":
				return (
					<QuestionForm
						mode={mode as "create" | "edit"}
						initialData={initialData}
						sections={contextData?.sections || []}
						onSubmit={handleSubmit}
						onCancel={onClose}
						isLoading={isLoading}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent aria-describedby={undefined} className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{getModalTitle()}</DialogTitle>
				</DialogHeader>
				{renderForm()}
			</DialogContent>
		</Dialog>
	);
}
