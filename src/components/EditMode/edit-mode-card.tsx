"use client";

import { type ReactNode } from "react";

import { EditModeToolbar } from "@/components/EditMode/edit-mode-toolbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EditModeCardProps {
	children: ReactNode;
	isEditMode: boolean;
	onAdd?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onMove?: () => void;
	canAdd?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	canMove?: boolean;
	className?: string;
}

export function EditModeCard({
	children,
	isEditMode,
	onAdd,
	onEdit,
	onDelete,
	onMove,
	canAdd = true,
	canEdit = true,
	canDelete = true,
	canMove = false,
	className,
}: EditModeCardProps) {
	return (
		<Card
			className={cn(
				"relative mb-8 transition-all duration-200",
				isEditMode && "ring-2 ring-primary/20 hover:shadow-lg hover:ring-primary/40",
				className
			)}
		>
			{isEditMode && (
				<CardHeader className="pb-2">
					<div className="flex items-center justify-end">
						<EditModeToolbar
							onAdd={onAdd}
							onEdit={onEdit}
							onDelete={onDelete}
							onMove={onMove}
							canAdd={canAdd}
							canEdit={canEdit}
							canDelete={canDelete}
							canMove={canMove}
						/>
					</div>
				</CardHeader>
			)}

			<CardContent>{children}</CardContent>
		</Card>
	);
}
