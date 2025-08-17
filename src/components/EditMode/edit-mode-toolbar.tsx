"use client";

import { Edit, Move, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditModeToolbarProps {
	onAdd?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onMove?: () => void;
	canAdd?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	canMove?: boolean;
	className?: string;
	size?: "sm" | "default";
	variant?: "default" | "outline" | "ghost";
}

export function EditModeToolbar({
	onAdd,
	onEdit,
	onDelete,
	onMove,
	canAdd = true,
	canEdit = true,
	canDelete = true,
	canMove = false,
	className,
	size = "sm",
	variant = "outline",
}: EditModeToolbarProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			{canAdd && onAdd && (
				<Button
					onClick={onAdd}
					variant={variant}
					size={size}
					className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
				>
					<Plus className="h-4 w-4" />
					Aggiungi
				</Button>
			)}

			{canEdit && onEdit && (
				<Button
					onClick={onEdit}
					variant={variant}
					size={size}
					className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
				>
					<Edit className="h-4 w-4" />
					Modifica
				</Button>
			)}

			{canMove && onMove && (
				<Button
					onClick={onMove}
					variant={variant}
					size={size}
					className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950"
				>
					<Move className="h-4 w-4" />
					Sposta
				</Button>
			)}

			{canDelete && onDelete && (
				<Button
					onClick={onDelete}
					variant={variant}
					size={size}
					className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
				>
					<Trash2 className="h-4 w-4" />
					Elimina
				</Button>
			)}
		</div>
	);
}
