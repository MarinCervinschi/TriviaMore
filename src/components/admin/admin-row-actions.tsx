import type { ReactNode } from "react";

import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";

import { Button } from "@/components/ui/button";

export function AdminRowActions({
	children,
	onDelete,
	label,
}: {
	children?: ReactNode;
	onDelete?: () => void;
	label?: string;
}) {
	return (
		<div className="flex items-center justify-end gap-1">
			{children && (
				<Button
					variant="ghost"
					size="icon"
					className="rounded-lg"
					asChild
					aria-label={label ? `Modifica ${label}` : "Modifica"}
				>
					{children}
				</Button>
			)}
			{onDelete && (
				<Button
					variant="ghost"
					size="icon"
					className="rounded-lg"
					onClick={onDelete}
					aria-label={label ? `Elimina ${label}` : "Elimina"}
				>
					<TrashBinMinimalisticIcon className="text-danger h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
