"use client";

import { useState } from "react";

import { Heart, Minus, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

interface AddClassButtonProps {
	classId: string;
	className: string;
	isEnrolled?: boolean;
}

export function AddClassButton({
	classId,
	className,
	isEnrolled = false,
}: AddClassButtonProps) {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [enrolled, setEnrolled] = useState(isEnrolled);

    console.log("User ID:", session?.user?.id);
	if (!session?.user?.id) {
		return null; // Non mostrare il pulsante se l'utente non è loggato
	}

	const handleToggleClass = async () => {
		setIsLoading(true);
		try {
			// Per ora simuliamo l'aggiunta/rimozione
			// TODO: Implementare la chiamata API per aggiungere/rimuovere la classe
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call

			setEnrolled(!enrolled);
		} catch (error) {
			console.error("Errore nella gestione della classe:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (enrolled) {
		return (
			<Button
				onClick={handleToggleClass}
				disabled={isLoading}
				variant="outline"
				size="sm"
				className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
			>
				{isLoading ? (
					<>
						<div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
						Rimuovendo...
					</>
				) : (
					<>
						<Minus className="mr-1 h-3 w-3" />
						Rimuovi dai miei corsi
					</>
				)}
			</Button>
		);
	}

	return (
		<Button
			onClick={handleToggleClass}
			disabled={isLoading}
			size="sm"
			className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
		>
			{isLoading ? (
				<>
					<div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
					Aggiungendo...
				</>
			) : (
				<>
					<Plus className="mr-1 h-3 w-3" />
					Aggiungi ai miei corsi
				</>
			)}
		</Button>
	);
}
