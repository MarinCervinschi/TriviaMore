"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Department mutations
interface CreateDepartmentParams {
	name: string;
	code: string;
	description?: string;
	position?: number;
}

interface UpdateDepartmentParams {
	id: string;
	name?: string;
	code?: string;
	description?: string;
	position?: number;
}

interface DeleteDepartmentParams {
	id: string;
}

// Course mutations
interface CreateCourseParams {
	name: string;
	code: string;
	description?: string;
	departmentId: string;
	courseType: "BACHELOR" | "MASTER";
	position?: number;
}

interface UpdateCourseParams {
	id: string;
	name?: string;
	code?: string;
	description?: string;
	courseType?: "BACHELOR" | "MASTER";
	position?: number;
}

interface DeleteCourseParams {
	id: string;
}

// Class mutations
interface CreateClassParams {
	name: string;
	code: string;
	description?: string;
	courseId: string;
	classYear: number;
	position?: number;
}

interface UpdateClassParams {
	id: string;
	name?: string;
	code?: string;
	description?: string;
	classYear?: number;
	position?: number;
}

interface DeleteClassParams {
	id: string;
}

// Section mutations
interface CreateSectionParams {
	name: string;
	description?: string;
	classId: string;
	isPublic?: boolean;
	position?: number;
}

interface UpdateSectionParams {
	id: string;
	name?: string;
	description?: string;
	isPublic?: boolean;
	position?: number;
}

interface DeleteSectionParams {
	id: string;
}

// Question mutations
interface CreateQuestionParams {
	content: string;
	questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options?: any;
	correctAnswer: string[];
	explanation?: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	sectionId: string;
}

interface UpdateQuestionParams {
	id: string;
	content?: string;
	questionType?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options?: any;
	correctAnswer?: string[];
	explanation?: string;
	difficulty?: "EASY" | "MEDIUM" | "HARD";
}

interface DeleteQuestionParams {
	id: string;
}

export function useEditMutations() {
	const queryClient = useQueryClient();

	// Department mutations
	const createDepartment = useMutation({
		mutationFn: async (params: CreateDepartmentParams) => {
			const response = await fetch("/api/protected/admin/departments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nella creazione del dipartimento");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success("Dipartimento creato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateDepartment = useMutation({
		mutationFn: async (params: UpdateDepartmentParams) => {
			const response = await fetch(`/api/protected/admin/departments/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'aggiornamento del dipartimento");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success("Dipartimento aggiornato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteDepartment = useMutation({
		mutationFn: async (params: DeleteDepartmentParams) => {
			const response = await fetch(`/api/protected/admin/departments/${params.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'eliminazione del dipartimento");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success("Dipartimento eliminato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Course mutations
	const createCourse = useMutation({
		mutationFn: async (params: CreateCourseParams) => {
			const response = await fetch("/api/protected/admin/courses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nella creazione del corso");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			toast.success("Corso creato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateCourse = useMutation({
		mutationFn: async (params: UpdateCourseParams) => {
			const response = await fetch(`/api/protected/admin/courses/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'aggiornamento del corso");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			toast.success("Corso aggiornato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteCourse = useMutation({
		mutationFn: async (params: DeleteCourseParams) => {
			const response = await fetch(`/api/protected/admin/courses/${params.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'eliminazione del corso");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			toast.success("Corso eliminato con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Class mutations
	const createClass = useMutation({
		mutationFn: async (params: CreateClassParams) => {
			const response = await fetch("/api/protected/admin/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nella creazione della classe");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			toast.success("Classe creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateClass = useMutation({
		mutationFn: async (params: UpdateClassParams) => {
			const response = await fetch(`/api/protected/admin/classes/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'aggiornamento della classe");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			toast.success("Classe aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteClass = useMutation({
		mutationFn: async (params: DeleteClassParams) => {
			const response = await fetch(`/api/protected/admin/classes/${params.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'eliminazione della classe");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
			toast.success("Classe eliminata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Section mutations
	const createSection = useMutation({
		mutationFn: async (params: CreateSectionParams) => {
			const response = await fetch("/api/protected/admin/sections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nella creazione della sezione");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sections"] });
			toast.success("Sezione creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateSection = useMutation({
		mutationFn: async (params: UpdateSectionParams) => {
			const response = await fetch(`/api/protected/admin/sections/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'aggiornamento della sezione");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sections"] });
			toast.success("Sezione aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteSection = useMutation({
		mutationFn: async (params: DeleteSectionParams) => {
			const response = await fetch(`/api/protected/admin/sections/${params.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'eliminazione della sezione");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sections"] });
			toast.success("Sezione eliminata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Question mutations
	const createQuestion = useMutation({
		mutationFn: async (params: CreateQuestionParams) => {
			const response = await fetch("/api/protected/admin/questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nella creazione della domanda");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			toast.success("Domanda creata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const updateQuestion = useMutation({
		mutationFn: async (params: UpdateQuestionParams) => {
			const response = await fetch(`/api/protected/admin/questions/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'aggiornamento della domanda");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			toast.success("Domanda aggiornata con successo");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteQuestion = useMutation({
		mutationFn: async (params: DeleteQuestionParams) => {
			const response = await fetch(`/api/protected/admin/questions/${params.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore nell'eliminazione della domanda");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
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
