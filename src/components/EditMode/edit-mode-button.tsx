"use client";

import { Edit, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditModeButtonProps {
	isActive: boolean;
	onToggle: () => void;
	className?: string;
	size?: "sm" | "default" | "lg";
	variant?: "default" | "outline" | "ghost";
}

export function EditModeButton({
	isActive,
	onToggle,
	className,
	size = "default",
	variant = "outline",
}: EditModeButtonProps) {
	return (
		<Button
			onClick={onToggle}
			variant={isActive ? "default" : variant}
			size={size}
			className={cn(
				"transition-all duration-200",
				isActive && "bg-primary text-primary-foreground shadow-md",
				className
			)}
		>
			{isActive ? (
				<>
					<Settings className="h-4 w-4" />
					Modalità Modifica Attiva
				</>
			) : (
				<>
					<Edit className="h-4 w-4" />
					Modalità Modifica
				</>
			)}
		</Button>
	);
}
