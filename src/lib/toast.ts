import { toast } from "sonner";

/** A success toast with an undo action, shown longer than the default. */
export function toastUndo(message: string, undo: () => void, label = "Annulla") {
	toast.success(message, {
		duration: 10_000,
		action: { label, onClick: undo },
	});
}
