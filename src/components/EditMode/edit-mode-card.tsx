"use client";

import { type ReactNode, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EditModeToolbar } from "@/components/EditMode/edit-mode-toolbar";
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
	title?: string;
	description?: string;
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
	title,
	description,
}: EditModeCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Card
			className={cn(
				"relative transition-all duration-200",
				isEditMode && "ring-2 ring-primary/20 hover:ring-primary/40",
				isEditMode && isHovered && "shadow-lg",
				className
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{isEditMode && (isHovered || title) && (
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div>
							{title && (
								<h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
							)}
							{description && (
								<p className="text-xs text-muted-foreground/70">{description}</p>
							)}
						</div>
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

			<CardContent className={cn(isEditMode && (isHovered || title) ? "pt-0" : "pt-6")}>
				{children}
			</CardContent>

			{/* Floating toolbar for mobile/touch devices */}
			{isEditMode && !title && (
				<div
					className={cn(
						"absolute right-2 top-2 opacity-0 transition-opacity duration-200",
						isHovered && "opacity-100"
					)}
				>
					<EditModeToolbar
						onAdd={onAdd}
						onEdit={onEdit}
						onDelete={onDelete}
						onMove={onMove}
						canAdd={canAdd}
						canEdit={canEdit}
						canDelete={canDelete}
						canMove={canMove}
						size="sm"
						variant="ghost"
						className="rounded-md bg-background/80 p-1 shadow-md backdrop-blur-sm"
					/>
				</div>
			)}
		</Card>
	);
}
