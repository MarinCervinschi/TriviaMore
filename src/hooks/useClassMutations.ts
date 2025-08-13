"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddClassParams {
	classId: string;
	className: string;
}

interface RemoveClassParams {
	classId: string;
	className: string;
}

const addClassFetch = async (params: AddClassParams): Promise<void> => {
	const response = await fetch("/api/protected/userClass", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ classId: params.classId }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nell'aggiunta della classe");
	}
};

const removeClassFetch = async (params: RemoveClassParams): Promise<void> => {
	const response = await fetch(`/api/protected/userClass?classId=${params.classId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nella rimozione della classe");
	}
};

export function useClassMutations() {
	const addClass = useMutation({
		mutationFn: addClassFetch,
		onSuccess: (_, variables) => {
			toast.success(`Classe "${variables.className}" aggiunta ai tuoi corsi!`);
			window.location.reload();
		},
		onError: (error: Error, variables) => {
			console.error("Errore nell'aggiunta della classe:", error);
			toast.error(error.message || `Errore nell'aggiunta di "${variables.className}"`);
		},
	});

	const removeClass = useMutation({
		mutationFn: removeClassFetch,
		onSuccess: (_, variables) => {
			toast.success(`Classe "${variables.className}" rimossa dai tuoi corsi!`);
			window.location.reload();
		},
		onError: (error: Error, variables) => {
			console.error("Errore nella rimozione della classe:", error);
			toast.error(
				error.message || `Errore nella rimozione di "${variables.className}"`
			);
		},
	});

	return {
		addClass,
		removeClass,
		isLoading: addClass.isPending || removeClass.isPending,
	};
}
