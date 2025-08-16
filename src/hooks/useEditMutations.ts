"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	ClassBody,
	CourseBody,
	DepartmentBody,
	QuestionBody,
	SectionBody,
	nodeType,
} from "@/lib/types/crud.types";

type Body = ClassBody | CourseBody | DepartmentBody | QuestionBody | SectionBody;

interface CreateQuestionParams {
	sectionId?: string;
	body: QuestionBody | QuestionBody[];
	many: boolean;
}

interface UpdateNodeParams {
	nodeType: nodeType;
	id: string;
	sectionId?: string;
	body: QuestionBody | QuestionBody[];
}

interface DeleteNodeParams {
	nodeType: nodeType;
	id: string;
	sectionId?: string;
}

const fetchCreateNodeType = async (nodeType: string, body: Body) => {
	const response = await fetch(`/api/protected/admin/crud?nodeType=${nodeType}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.error || "Errore nella creazione dell'operazione CRUD per " + nodeType
		);
	}
};

const fetchUpdateNodeType = async ({ nodeType, id, body }: UpdateNodeParams) => {
	const response = await fetch(`/api/protected/admin/crud?nodeType=${nodeType}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.error || "Errore nell'aggiornamento dell'operazione CRUD per " + nodeType
		);
	}
};

const fetchDeleteNodeType = async ({ nodeType, id }: DeleteNodeParams) => {
	const response = await fetch(`/api/protected/admin/crud?nodeType=${nodeType}/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.error || "Errore nell'eliminazione dell'operazione CRUD per " + nodeType
		);
	}
};

const fetchCreateQuestion = async ({ body, many }: CreateQuestionParams) => {
	const response = await fetch(`/api/protected/admin/crud/questions?JSON=${many}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.error || "Errore nella creazione dell'operazione CRUD per questions"
		);
	}
};

export function useEditMutations() {
	const queryClient = useQueryClient();

	// Department mutations
	const createDepartment = useMutation({
		mutationFn: (body: DepartmentBody) => fetchCreateNodeType("departments", body),
		onSuccess: () => {
			toast.success("Dipartimento creato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateDepartment = useMutation({
		mutationFn: ({ id, body }: UpdateNodeParams) =>
			fetchUpdateNodeType({ nodeType: "department", id, body }),
		onSuccess: () => {
			toast.success("Dipartimento aggiornato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteDepartment = useMutation({
		mutationFn: ({ id }: DeleteNodeParams) =>
			fetchDeleteNodeType({ nodeType: "department", id }),
		onSuccess: () => {
			toast.success("Dipartimento eliminato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Course mutations
	const createCourse = useMutation({
		mutationFn: (body: CourseBody) => fetchCreateNodeType("courses", body),
		onSuccess: () => {
			toast.success("Corso creato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateCourse = useMutation({
		mutationFn: ({ id, body }: UpdateNodeParams) =>
			fetchUpdateNodeType({ nodeType: "course", id, body }),
		onSuccess: () => {
			toast.success("Corso aggiornato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteCourse = useMutation({
		mutationFn: ({ id }: DeleteNodeParams) =>
			fetchDeleteNodeType({ nodeType: "course", id }),
		onSuccess: () => {
			toast.success("Corso eliminato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Class mutations
	const createClass = useMutation({
		mutationFn: (body: ClassBody) => fetchCreateNodeType("classes", body),
		onSuccess: () => {
			toast.success("Classe creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateClass = useMutation({
		mutationFn: ({ id, body }: UpdateNodeParams) =>
			fetchUpdateNodeType({ nodeType: "class", id, body }),
		onSuccess: () => {
			toast.success("Classe aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteClass = useMutation({
		mutationFn: ({ id }: DeleteNodeParams) =>
			fetchDeleteNodeType({ nodeType: "class", id }),
		onSuccess: () => {
			toast.success("Classe eliminata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Section mutations
	const createSection = useMutation({
		mutationFn: (body: SectionBody) => fetchCreateNodeType("sections", body),
		onSuccess: () => {
			toast.success("Sezione creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateSection = useMutation({
		mutationFn: ({ id, body }: UpdateNodeParams) =>
			fetchUpdateNodeType({ nodeType: "section", id, body }),
		onSuccess: () => {
			toast.success("Sezione aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteSection = useMutation({
		mutationFn: ({ id }: DeleteNodeParams) =>
			fetchDeleteNodeType({ nodeType: "section", id }),
		onSuccess: () => {
			toast.success("Sezione eliminata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Question mutations
	const createQuestion = useMutation({
		mutationFn: ({ body, many }: CreateQuestionParams) =>
			fetchCreateQuestion({ body, many }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["section-questions", variables.sectionId],
			});
			toast.success("Domanda creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateQuestion = useMutation({
		mutationFn: ({ id, body }: UpdateNodeParams) =>
			fetchUpdateNodeType({ nodeType: "question", id, body }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["section-questions", variables.sectionId],
			});
			toast.success("Domanda aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteQuestion = useMutation({
		mutationFn: ({ id }: DeleteNodeParams) =>
			fetchDeleteNodeType({ nodeType: "question", id }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["section-questions", variables.sectionId],
			});
			toast.success("Domanda eliminata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	return {
		// Department mutations
		createDepartment,
		updateDepartment,
		deleteDepartment,

		// Course mutations
		createCourse,
		updateCourse,
		deleteCourse,

		// Class mutations
		createClass,
		updateClass,
		deleteClass,

		// Section mutations
		createSection,
		updateSection,
		deleteSection,

		// Question mutations
		createQuestion,
		updateQuestion,
		deleteQuestion,

		// Loading states
		isLoading:
			createDepartment.isPending ||
			updateDepartment.isPending ||
			deleteDepartment.isPending ||
			createCourse.isPending ||
			updateCourse.isPending ||
			deleteCourse.isPending ||
			createClass.isPending ||
			updateClass.isPending ||
			deleteClass.isPending ||
			createSection.isPending ||
			updateSection.isPending ||
			deleteSection.isPending ||
			createQuestion.isPending ||
			updateQuestion.isPending ||
			deleteQuestion.isPending,
	};
}
