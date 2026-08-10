import type { ReactNode } from "react";

import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";

import { Button } from "@/components/ui/button";

export function AdminRowActions({
	children,
	onDelete,
}: {
	/** The edit affordance, usually a `<Link>` wrapping an icon. */
	children?: ReactNode;
	onDelete?: () => void;
}) {
	return (
		<div className="flex items-center justify-end gap-1">
			{children && (
				<Button variant="ghost" size="icon" className="rounded-lg" asChild>
					{children}
				</Button>
			)}
			{onDelete && (
				<Button
					variant="ghost"
					size="icon"
					className="rounded-lg"
					onClick={onDelete}
					aria-label="Elimina"
				>
					<TrashBinMinimalisticIcon className="text-destructive h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
