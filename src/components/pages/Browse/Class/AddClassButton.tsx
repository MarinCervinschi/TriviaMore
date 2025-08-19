"use client";

import { useState } from "react";

import { Heart, Minus, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useClassMutations } from "@/hooks/useClassMutations";

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
	const { addClass, removeClass, isLoading } = useClassMutations();
	const [hasClass, setHasClass] = useState(isEnrolled);

	if (!session?.user?.id) {
		return null;
	}

	const handleToggleClass = async () => {
		if (hasClass) {
			await removeClass.mutateAsync({ classId, className });
			setHasClass(false);
		} else {
			await addClass.mutateAsync({ classId, className });
			setHasClass(true);
		}
	};

	if (hasClass) {
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
