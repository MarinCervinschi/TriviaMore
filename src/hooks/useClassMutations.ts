"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
	const response = await fetch("/api/protected/user/classes", {
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
	const response = await fetch(
		`/api/protected/user/classes?classId=${params.classId}`,
		{
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nella rimozione della classe");
	}
};

export function useClassMutations(userId: string) {
	const queryClient = useQueryClient();

	const addClass = useMutation({
		mutationFn: addClassFetch,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userClasses", userId] });
			queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
			toast.success(`Classe "${variables.className}" aggiunta ai tuoi corsi!`);
		},
		onError: (error: Error, variables) => {
			console.error("Errore nell'aggiunta della classe:", error);
			toast.error(error.message || `Errore nell'aggiunta di "${variables.className}"`);
		},
	});

	const removeClass = useMutation({
		mutationFn: removeClassFetch,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userClasses", userId] });
			queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
			toast.success(`Classe "${variables.className}" rimossa dai tuoi corsi!`);
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
