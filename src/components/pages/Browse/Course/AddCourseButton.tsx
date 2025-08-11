"use client";

import { useState } from "react";

import { Heart, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

interface AddCourseButtonProps {
	courseId: string;
	courseName: string;
}

export function AddCourseButton({ courseId, courseName }: AddCourseButtonProps) {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [isAdded, setIsAdded] = useState(false);

	if (!session?.user?.id) {
		return null; // Non mostrare il pulsante se l'utente non è loggato
	}

	const handleAddCourse = async () => {
		setIsLoading(true);
		try {
			// Per ora simuliamo l'aggiunta
			// TODO: Implementare la chiamata API per aggiungere il corso alla lista dell'utente
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call

			setIsAdded(true);

			// Feedback visivo temporaneo
			setTimeout(() => {
				setIsAdded(false);
			}, 2000);
		} catch (error) {
			console.error("Errore nell'aggiunta del corso:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isAdded) {
		return (
			<Button disabled className="bg-green-600 text-white hover:bg-green-600">
				<Heart className="mr-2 h-4 w-4 fill-current" />
				Aggiunto alla Lista
			</Button>
		);
	}

	return (
		<Button
			onClick={handleAddCourse}
			disabled={isLoading}
			className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			{isLoading ? (
				<>
					<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					Aggiungendo...
				</>
			) : (
				<>
					<Plus className="mr-2 h-4 w-4" />
					Aggiungi ai miei corsi
				</>
			)}
		</Button>
	);
}
